const Reading = require('../models/Reading');
const Bill = require('../models/Bill');
const Alert = require('../models/Alert');

const DEFAULT_TARIFF_PER_KWH = Number(process.env.TARIFF_PER_KWH || 8);
const DEFAULT_CO2_KG_PER_KWH = Number(process.env.CO2_KG_PER_KWH || 0.82);
const HIGH_USAGE_THRESHOLD_WATTS = Number(process.env.HIGH_USAGE_THRESHOLD_WATTS || 5000);

function calculateEnergyKwhFromReadings(readings) {
  if (!Array.isArray(readings) || readings.length < 2) {
    return 0;
  }

  let energyKwh = 0;
  for (let i = 1; i < readings.length; i += 1) {
    const prev = readings[i - 1];
    const curr = readings[i];
    const dtHours = (new Date(curr.timestamp).getTime() - new Date(prev.timestamp).getTime()) / (1000 * 60 * 60);
    if (!Number.isFinite(dtHours) || dtHours <= 0) {
      continue;
    }

    const prevPower = Number(prev.power_watts || 0);
    const currPower = Number(curr.power_watts || 0);
    const avgPower = (prevPower + currPower) / 2;
    energyKwh += (avgPower * dtHours) / 1000;
  }

  return Math.max(0, energyKwh);
}

function computeAnomaly(latestReading) {
  const flags = [];
  let score = 0;

  if (!latestReading) {
    return {
      score: 0,
      level: 'LOW',
      flags,
    };
  }

  const power = Number(latestReading.power_watts || 0);
  const voltage = Number(latestReading.voltage || 0);
  const powerFactor = Number(latestReading.power_factor || 0);
  const frequency = Number(latestReading.frequency_hz || 0);

  if (power <= 1 && voltage >= 100) {
    score += 45;
    flags.push('Possible sudden drop / bypass pattern');
  }
  if (power >= HIGH_USAGE_THRESHOLD_WATTS) {
    score += 30;
    flags.push('High instantaneous load detected');
  }
  if (powerFactor > 0 && powerFactor < 0.7) {
    score += 20;
    flags.push('Low power factor (possible inefficiency)');
  }
  if (voltage > 0 && (voltage < 210 || voltage > 250)) {
    score += 15;
    flags.push('Voltage outside preferred range');
  }
  if (frequency > 0 && (frequency < 49 || frequency > 51)) {
    score += 10;
    flags.push('Frequency deviation observed');
  }

  const bounded = Math.min(100, score);
  const level = bounded >= 70 ? 'HIGH' : bounded >= 35 ? 'MEDIUM' : 'LOW';

  return {
    score: bounded,
    level,
    flags,
  };
}

// Get the most recent energy reading for a specific meter
exports.getLiveReading = async (req, res) => {
  try {
    const { meterId } = req.params;
    
    const latestReading = await Reading.findOne({ meterId })
      .sort({ timestamp: -1 })
      .limit(1);
    
    if (!latestReading) {
      return res.status(404).json({ error: 'No readings found for this meter' });
    }
    
    res.json({
      meterId: latestReading.meterId,
      timestamp: latestReading.timestamp,
      power_watts: latestReading.power_watts,
      voltage: latestReading.voltage,
      current: latestReading.current,
      apparent_power_va: latestReading.apparent_power_va,
      reactive_power_var: latestReading.reactive_power_var,
      power_factor: latestReading.power_factor,
      frequency_hz: latestReading.frequency_hz,
      energy_wh: latestReading.energy_wh
    });
  } catch (error) {
    console.error('Error fetching live reading:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get historical readings for a period (6h, 24h, 7d)
exports.getHistoricalReadings = async (req, res) => {
  try {
    const { meterId } = req.params;
    const { period = '24h' } = req.query;
    
    // Calculate time range based on period
    const now = new Date();
    let startTime;
    
    switch (period) {
      case '6h':
        startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    
    const readings = await Reading.find({
      meterId,
      timestamp: { $gte: startTime }
    })
      .sort({ timestamp: 1 })
      .select('timestamp power_watts voltage current apparent_power_va reactive_power_var power_factor frequency_hz energy_wh');
    
    res.json(readings);
  } catch (error) {
    console.error('Error fetching historical readings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all historical bills for a meter
exports.getBills = async (req, res) => {
  try {
    const { meterId } = req.params;
    
    const bills = await Bill.find({ meterId })
      .sort({ year: -1, month: -1 });
    
    res.json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all alerts for a meter
exports.getAlerts = async (req, res) => {
  try {
    const { meterId } = req.params;
    
    const alerts = await Alert.find({ meterId })
      .sort({ timestamp: -1 })
      .limit(50); // Limit to last 50 alerts
    
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get actionable meter insights for demo and decision support
exports.getMeterInsights = async (req, res) => {
  try {
    const { meterId } = req.params;

    const latestReading = await Reading.findOne({ meterId })
      .sort({ timestamp: -1 })
      .limit(1);

    if (!latestReading) {
      return res.status(404).json({ error: 'No readings found for this meter' });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayReadings = await Reading.find({
      meterId,
      timestamp: { $gte: startOfToday },
    })
      .sort({ timestamp: 1 })
      .select('timestamp power_watts');

    const todayEnergyKwh = calculateEnergyKwhFromReadings(todayReadings);

    const daysInCurrentMonth = new Date(
      startOfToday.getFullYear(),
      startOfToday.getMonth() + 1,
      0,
    ).getDate();

    const monthlyForecastKwh = todayEnergyKwh * daysInCurrentMonth;
    const forecastBill = monthlyForecastKwh * DEFAULT_TARIFF_PER_KWH;
    const todayCost = todayEnergyKwh * DEFAULT_TARIFF_PER_KWH;
    const todayCarbonKg = todayEnergyKwh * DEFAULT_CO2_KG_PER_KWH;

    const anomaly = computeAnomaly(latestReading);
    const recommendations = [];

    if (anomaly.score >= 70) {
      recommendations.push('Inspect meter and wiring immediately for anomaly investigation.');
    }
    if (Number(latestReading.power_factor || 0) > 0 && Number(latestReading.power_factor || 0) < 0.7) {
      recommendations.push('Consider PF correction (capacitor bank) to improve efficiency.');
    }
    if (Number(latestReading.power_watts || 0) >= HIGH_USAGE_THRESHOLD_WATTS) {
      recommendations.push('Shift heavy loads to non-peak hours to reduce stress and cost.');
    }
    if (recommendations.length === 0) {
      recommendations.push('System is stable. Continue periodic monitoring.');
    }

    return res.json({
      meterId,
      generatedAt: new Date(),
      anomaly,
      forecast: {
        tariffPerKwh: DEFAULT_TARIFF_PER_KWH,
        todayEnergyKwh: Number(todayEnergyKwh.toFixed(3)),
        monthlyForecastKwh: Number(monthlyForecastKwh.toFixed(2)),
        monthlyForecastBill: Number(forecastBill.toFixed(2)),
        todayCost: Number(todayCost.toFixed(2)),
      },
      sustainability: {
        co2KgPerKwh: DEFAULT_CO2_KG_PER_KWH,
        todayCarbonKg: Number(todayCarbonKg.toFixed(3)),
      },
      recommendations,
    });
  } catch (error) {
    console.error('Error fetching meter insights:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
