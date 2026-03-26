const reportService = require('../services/reportService');
const aiService = require('../services/aiService');

exports.getDashboardStats = async (req, res) => {
    try {
        const stats = await reportService.getDashboardStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSalesTrend = async (req, res) => {
    try {
        const { period } = req.query;
        const trend = await reportService.getSalesTrend(period);
        res.json(trend);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getRecentSales = async (req, res) => {
    try {
        const sales = await reportService.getRecentSales();
        res.json(sales);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getLowStock = async (req, res) => {
    try {
        const items = await reportService.getLowStockItems();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSales = async (req, res) => {
    try {
        const { type = 'daily', date } = req.query;
        const sales = await reportService.getSales(type, date || new Date());
        res.json(sales);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAiInsights = async (req, res) => {
    try {
        const stats = await reportService.getDashboardStats();
        const insights = await aiService.getDashboardInsights(stats);
        res.json({ insights });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
