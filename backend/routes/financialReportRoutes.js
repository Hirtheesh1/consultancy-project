const express = require('express');
const router = express.Router();
const reportController = require('../controllers/financialReportController');

router.get('/sales-summary', reportController.getSalesSummary);
router.get('/purchase-summary', reportController.getPurchaseSummary);
router.get('/gst-summary', reportController.getGSTSummary);
router.get('/profit-and-loss', reportController.getProfitAndLoss);
router.get('/inventory-valuation', reportController.getInventoryValuation);
router.get('/fy-summary', reportController.getFinancialYearSummary);

module.exports = router;
