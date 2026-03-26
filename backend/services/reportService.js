const { Sale, SaleItem, Product, Purchase } = require('../models');
const { Sequelize, Op } = require('sequelize');
const financialReportService = require('./financialReportService');
const gstReportService = require('./gstReportService');

class ReportService {

    async getDashboardStats() {
        const totalProducts = await Product.count();

        // Low Stock
        const lowStockCount = await Product.count({
            where: {
                stock_quantity: {
                    [Op.lte]: Sequelize.col('reorder_level')
                }
            }
        });

        // Sales Today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const salesToday = await Sale.sum('grand_total', {
            where: {
                date: { [Op.gte]: startOfDay }
            }
        }) || 0;

        // New Financial Metrics for Dashboard
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const currentMonthSales = await gstReportService.getSalesSummary(startOfMonth, endOfMonth);
        const currentMonthPurchases = await gstReportService.getPurchaseSummary(startOfMonth, endOfMonth);
        const currentMonthGST = await gstReportService.getGSTSummary(startOfMonth, endOfMonth);
        const inventoryValuation = await financialReportService.getInventoryValuation();

        const monthlyRevenue = currentMonthSales.total_sales || 0;
        const monthlyProfit = monthlyRevenue - (currentMonthPurchases.total_purchases || 0);
        const gstPayable = currentMonthGST.net_gst_payable || 0;
        const inventoryValue = inventoryValuation.total_stock_value || 0;

        return {
            totalProducts,
            lowStockCount,
            salesToday,
            monthlyRevenue,
            monthlyProfit,
            gstPayable,
            inventoryValue
        };
    }

    async getSalesTrend(period = 'monthly') {
        let dateFormat;
        let limitDate = new Date();
        let groupBy;

        switch (period) {
            case 'daily':
                dateFormat = '%Y-%m-%d';
                limitDate.setDate(limitDate.getDate() - 30); // Last 30 days
                groupBy = Sequelize.fn('strftime', dateFormat, Sequelize.col('date'));
                break;
            case 'yearly':
                dateFormat = '%Y';
                limitDate.setFullYear(limitDate.getFullYear() - 5); // Last 5 years
                groupBy = Sequelize.fn('strftime', dateFormat, Sequelize.col('date'));
                break;
            case 'monthly':
            default:
                dateFormat = '%Y-%m';
                limitDate.setFullYear(limitDate.getFullYear() - 1); // Last 1 year
                groupBy = Sequelize.fn('strftime', dateFormat, Sequelize.col('date'));
                break;
        }

        const sales = await Sale.findAll({
            attributes: [
                [groupBy, 'period'],
                [Sequelize.fn('SUM', Sequelize.col('grand_total')), 'total'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
            ],
            where: {
                date: {
                    [Op.gte]: limitDate
                }
            },
            group: [groupBy],
            order: [[Sequelize.col('period'), 'ASC']]
        });

        return sales;
    }

    async getRecentSales() {
        return await Sale.findAll({
            limit: 5,
            order: [['date', 'DESC']],
            attributes: ['id', 'invoice_number', 'customer_name', 'grand_total', 'date', 'payment_method']
        });
    }

    async getLowStockItems() {
        return await Product.findAll({
            where: {
                stock_quantity: {
                    [Op.lte]: Sequelize.col('reorder_level')
                }
            },
            limit: 10,
            order: [['stock_quantity', 'ASC']]
        });
    }

    async getSales(type, date) {
        const targetDate = new Date(date);
        let startDate, endDate;

        if (type === 'daily') {
            startDate = new Date(targetDate);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(targetDate);
            endDate.setHours(23, 59, 59, 999);
        } else if (type === 'monthly') {
            startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
            endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999);
        } else if (type === 'yearly') {
            startDate = new Date(targetDate.getFullYear(), 0, 1);
            endDate = new Date(targetDate.getFullYear(), 11, 31, 23, 59, 59, 999);
        }

        return await Sale.findAll({
            where: {
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            order: [['date', 'ASC']]
        });
    }
}

module.exports = new ReportService();
