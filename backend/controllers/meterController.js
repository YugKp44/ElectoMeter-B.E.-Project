const Reading = require('../models/Reading');
const Bill = require('../models/Bill');
const Alert = require('../models/Alert');

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
      current: latestReading.current
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
      .select('timestamp power_watts voltage current');
    
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
