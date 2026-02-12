const Admin = require('../models/Admin');
const Meter = require('../models/Meter');
const Reading = require('../models/Reading');
const Bill = require('../models/Bill');
const Alert = require('../models/Alert');

// Admin login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find admin by username
    const admin = await Admin.findOne({ username });
    
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // In production, use bcrypt for password comparison
    // For now, direct comparison for demo
    if (admin.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Return admin data (excluding password)
    res.json({
      success: true,
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all meters
exports.getAllMeters = async (req, res) => {
  try {
    const meters = await Meter.find().sort({ createdAt: -1 });
    
    // Get latest reading for each meter
    const metersWithReadings = await Promise.all(
      meters.map(async (meter) => {
        const latestReading = await Reading.findOne({ meterId: meter.meterId })
          .sort({ timestamp: -1 })
          .limit(1);
        
        return {
          ...meter.toObject(),
          latestReading: latestReading || null,
        };
      })
    );

    res.json(metersWithReadings);
  } catch (error) {
    console.error('Get all meters error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get system statistics
exports.getSystemStats = async (req, res) => {
  try {
    // Total meters
    const totalMeters = await Meter.countDocuments();
    
    // Active meters (with readings in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentReadings = await Reading.distinct('meterId', {
      timestamp: { $gte: fiveMinutesAgo },
    });
    const activeMeters = recentReadings.length;

    // Total bills
    const totalBills = await Bill.countDocuments();
    const dueBills = await Bill.countDocuments({ status: 'DUE' });
    const paidBills = await Bill.countDocuments({ status: 'PAID' });

    // Total alerts
    const totalAlerts = await Alert.countDocuments();
    const theftAlerts = await Alert.countDocuments({ type: 'THEFT_SUSPICION' });
    const highUsageAlerts = await Alert.countDocuments({ type: 'HIGH_USAGE' });

    // Recent alerts (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentAlerts = await Alert.countDocuments({
      timestamp: { $gte: oneDayAgo },
    });

    // Total revenue
    const revenueResult = await Bill.aggregate([
      { $match: { status: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$amount_due' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Pending revenue
    const pendingResult = await Bill.aggregate([
      { $match: { status: 'DUE' } },
      { $group: { _id: null, total: { $sum: '$amount_due' } } },
    ]);
    const pendingRevenue = pendingResult[0]?.total || 0;

    // Total energy consumption (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const energyResult = await Bill.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$total_kwh' } } },
    ]);
    const totalEnergy = energyResult[0]?.total || 0;

    res.json({
      meters: {
        total: totalMeters,
        active: activeMeters,
        inactive: totalMeters - activeMeters,
      },
      bills: {
        total: totalBills,
        due: dueBills,
        paid: paidBills,
      },
      alerts: {
        total: totalAlerts,
        recent24h: recentAlerts,
        theftSuspicion: theftAlerts,
        highUsage: highUsageAlerts,
      },
      revenue: {
        total: totalRevenue,
        pending: pendingRevenue,
        collected: totalRevenue,
      },
      energy: {
        totalKwh: totalEnergy,
      },
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all bills across all meters
exports.getAllBills = async (req, res) => {
  try {
    const { status, limit = 100 } = req.query;
    
    let query = {};
    if (status) {
      query.status = status.toUpperCase();
    }

    const bills = await Bill.find(query)
      .sort({ year: -1, month: -1 })
      .limit(parseInt(limit));

    res.json(bills);
  } catch (error) {
    console.error('Get all bills error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update bill status
exports.updateBillStatus = async (req, res) => {
  try {
    const { billId } = req.params;
    const { status } = req.body;

    if (!['DUE', 'PAID'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const bill = await Bill.findByIdAndUpdate(
      billId,
      { status },
      { new: true }
    );

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.json(bill);
  } catch (error) {
    console.error('Update bill status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all alerts across all meters
exports.getAllAlerts = async (req, res) => {
  try {
    const { type, limit = 100 } = req.query;
    
    let query = {};
    if (type) {
      query.type = type.toUpperCase();
    }

    const alerts = await Alert.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(alerts);
  } catch (error) {
    console.error('Get all alerts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get meter details with full history
exports.getMeterDetails = async (req, res) => {
  try {
    const { meterId } = req.params;

    const meter = await Meter.findOne({ meterId });
    if (!meter) {
      return res.status(404).json({ message: 'Meter not found' });
    }

    // Get latest reading
    const latestReading = await Reading.findOne({ meterId })
      .sort({ timestamp: -1 })
      .limit(1);

    // Get all bills
    const bills = await Bill.find({ meterId }).sort({ year: -1, month: -1 });

    // Get all alerts
    const alerts = await Alert.find({ meterId }).sort({ timestamp: -1 });

    // Get reading count
    const readingCount = await Reading.countDocuments({ meterId });

    res.json({
      meter: meter.toObject(),
      latestReading,
      bills,
      alerts,
      statistics: {
        totalReadings: readingCount,
        totalBills: bills.length,
        totalAlerts: alerts.length,
      },
    });
  } catch (error) {
    console.error('Get meter details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get area-wise consumption analytics
exports.getAreaWiseAnalytics = async (req, res) => {
  try {
    // Get all meters grouped by area
    const meters = await Meter.find();
    
    // Group meters by area
    const areaGroups = {};
    meters.forEach(meter => {
      const area = meter.area || 'Zone A';
      if (!areaGroups[area]) {
        areaGroups[area] = [];
      }
      areaGroups[area].push(meter.meterId);
    });

    // Calculate consumption for each area
    const areaAnalytics = await Promise.all(
      Object.entries(areaGroups).map(async ([area, meterIds]) => {
        // Get total consumption (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        const bills = await Bill.aggregate([
          { 
            $match: { 
              meterId: { $in: meterIds },
              createdAt: { $gte: thirtyDaysAgo }
            } 
          },
          { 
            $group: { 
              _id: null, 
              totalKwh: { $sum: '$total_kwh' },
              totalAmount: { $sum: '$amount_due' }
            } 
          }
        ]);

        // Get current power consumption (latest readings)
        const latestReadings = await Reading.aggregate([
          { $match: { meterId: { $in: meterIds } } },
          { $sort: { timestamp: -1 } },
          { $group: { _id: '$meterId', latestPower: { $first: '$power_watts' } } },
          { $group: { _id: null, avgPower: { $avg: '$latestPower' }, totalPower: { $sum: '$latestPower' } } }
        ]);

        // Get hourly consumption for last 24 hours for trend
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const hourlyData = await Reading.aggregate([
          { 
            $match: { 
              meterId: { $in: meterIds },
              timestamp: { $gte: oneDayAgo }
            }
          },
          {
            $group: {
              _id: { 
                hour: { $hour: '$timestamp' }
              },
              avgPower: { $avg: '$power_watts' }
            }
          },
          { $sort: { '_id.hour': 1 } }
        ]);

        // Calculate prediction (simple linear regression based on last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const weeklyConsumption = await Bill.aggregate([
          { 
            $match: { 
              meterId: { $in: meterIds },
              createdAt: { $gte: sevenDaysAgo }
            } 
          },
          { 
            $group: { 
              _id: null, 
              totalKwh: { $sum: '$total_kwh' }
            } 
          }
        ]);

        const weeklyKwh = weeklyConsumption[0]?.totalKwh || 0;
        const dailyAvg = weeklyKwh / 7;
        const predictedNextMonth = dailyAvg * 30;
        const predictedNextWeek = dailyAvg * 7;

        return {
          area,
          meterCount: meterIds.length,
          consumption30Days: bills[0]?.totalKwh || 0,
          revenue30Days: bills[0]?.totalAmount || 0,
          currentPower: latestReadings[0]?.totalPower || 0,
          avgPowerPerMeter: latestReadings[0]?.avgPower || 0,
          hourlyTrend: hourlyData,
          prediction: {
            nextWeek: predictedNextWeek,
            nextMonth: predictedNextMonth,
            dailyAverage: dailyAvg,
            trend: weeklyKwh > 0 ? 'increasing' : 'stable'
          }
        };
      })
    );

    res.json(areaAnalytics);
  } catch (error) {
    console.error('Get area-wise analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get consumption prediction for the system
exports.getConsumptionPrediction = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysNum = parseInt(days);

    // Get historical data for last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const historicalData = await Reading.aggregate([
      { $match: { timestamp: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { 
            date: { 
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
            }
          },
          avgPower: { $avg: '$power_watts' },
          totalReadings: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Simple linear regression for prediction
    const dataPoints = historicalData.map((d, i) => ({
      x: i,
      y: d.avgPower
    }));

    if (dataPoints.length < 2) {
      return res.json({
        historical: historicalData,
        prediction: [],
        confidence: 0,
        trend: 'insufficient_data'
      });
    }

    // Calculate linear regression
    const n = dataPoints.length;
    const sumX = dataPoints.reduce((sum, p) => sum + p.x, 0);
    const sumY = dataPoints.reduce((sum, p) => sum + p.y, 0);
    const sumXY = dataPoints.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumX2 = dataPoints.reduce((sum, p) => sum + p.x * p.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Generate predictions
    const predictions = [];
    for (let i = 0; i < daysNum; i++) {
      const x = n + i;
      const predictedPower = slope * x + intercept;
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      
      predictions.push({
        date: date.toISOString().split('T')[0],
        predictedPower: Math.max(0, predictedPower),
        confidence: Math.max(0, 100 - (i * 2)) // Confidence decreases over time
      });
    }

    // Calculate trend
    const trend = slope > 5 ? 'increasing' : slope < -5 ? 'decreasing' : 'stable';
    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;

    res.json({
      historical: historicalData,
      prediction: predictions,
      confidence: avgConfidence,
      trend,
      slope,
      summary: {
        avgHistorical: sumY / n,
        avgPredicted: predictions.reduce((sum, p) => sum + p.predictedPower, 0) / predictions.length,
        changePercent: ((predictions[predictions.length - 1].predictedPower - (sumY / n)) / (sumY / n)) * 100
      }
    });
  } catch (error) {
    console.error('Get consumption prediction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create default admin (for initial setup)
exports.createDefaultAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    
    if (!existingAdmin) {
      await Admin.create({
        username: 'admin',
        password: 'admin123', // In production, hash this!
        name: 'System Administrator',
        email: 'admin@electometer.com',
        role: 'super_admin',
      });
      console.log('Default admin created: username=admin, password=admin123');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};
