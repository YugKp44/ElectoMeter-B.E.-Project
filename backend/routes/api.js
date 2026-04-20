const express = require('express');
const router = express.Router();
const meterController = require('../controllers/meterController');
const adminController = require('../controllers/adminController');
const espController = require('../controllers/espController');

// User/Meter endpoints
// Get live reading for a meter
router.get('/meters/:meterId/live', meterController.getLiveReading);

// Get historical readings for a meter
router.get('/meters/:meterId/history', meterController.getHistoricalReadings);

// Get all bills for a meter
router.get('/meters/:meterId/bills', meterController.getBills);

// Get all alerts for a meter
router.get('/meters/:meterId/alerts', meterController.getAlerts);

// Get insights for a meter (anomaly score, forecast, cost, carbon)
router.get('/meters/:meterId/insights', meterController.getMeterInsights);

// ESP ingestion endpoints
router.post('/esp/readings', espController.ingestReading);
router.get('/esp/status', espController.getEspStatus);

// Admin endpoints
// Admin login
router.post('/admin/login', adminController.login);

// Get system statistics
router.get('/admin/stats', adminController.getSystemStats);

// Get all meters with latest readings
router.get('/admin/meters', adminController.getAllMeters);

// Get specific meter details
router.get('/admin/meters/:meterId', adminController.getMeterDetails);

// Get all bills (with optional status filter)
router.get('/admin/bills', adminController.getAllBills);

// Update bill status
router.put('/admin/bills/:billId', adminController.updateBillStatus);

// Get all alerts (with optional type filter)
router.get('/admin/alerts', adminController.getAllAlerts);

// Get area-wise consumption analytics
router.get('/admin/analytics/area-wise', adminController.getAreaWiseAnalytics);

// Get consumption prediction
router.get('/admin/analytics/prediction', adminController.getConsumptionPrediction);

// Trigger demo events for presentation (power drop/spike/low PF)
router.post('/admin/demo/:meterId/trigger', adminController.triggerDemoEvent);

module.exports = router;
