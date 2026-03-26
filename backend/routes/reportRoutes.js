const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/dashboard', reportController.getDashboardStats);
router.get('/sales-trend', reportController.getSalesTrend);
router.get('/recent-sales', reportController.getRecentSales);
router.get('/low-stock', reportController.getLowStock);
router.get('/sales', reportController.getSales);
router.get('/ai-insights', reportController.getAiInsights);

module.exports = router;
