const { Sale, Purchase, Product, Category, SaleItem, sequelize } = require('../models');
const { Op } = require('sequelize');

class FinancialReportService {

    _getFinancialYearDates(yearStr) { // Format: "2023-2024"
        const startYear = parseInt(yearStr.split('-')[0]);
        const endYear = parseInt(yearStr.split('-')[1]);
        const startDate = new Date(`${startYear}-04-01T00:00:00.000Z`);
        const endDate = new Date(`${endYear}-03-31T23:59:59.999Z`);
        return { startDate, endDate };
    }

    async getProfitAndLoss(yearStr) {
        const { startDate, endDate } = this._getFinancialYearDates(yearStr);

        const sales = await Sale.sum('grand_total', {
            where: { date: { [Op.between]: [startDate, endDate] } }
        }) || 0;

        const purchases = await Purchase.sum('total_amount', {
            where: { purchase_date: { [Op.between]: [startDate, endDate] } }
        }) || 0;

        const gross_profit = sales - purchases;

        return {
            financial_year: yearStr,
            total_sales: sales,
            total_purchases: purchases,
            gross_profit,
            expenses: 0, // Mock for future expansion
            net_profit: gross_profit
        };
    }

    async getInventoryValuation() {
        const products = await Product.findAll({
            include: [Category]
        });

        let total_stock_value = 0;
        const valuation_by_category = {};

        products.forEach(p => {
            const qty = parseInt(p.stock_quantity || 0);
            const price = parseFloat(p.purchase_price || 0);
            const value = qty * price;

            total_stock_value += value;

            const catName = p.Category?.name || 'Uncategorized';
            if (!valuation_by_category[catName]) {
                valuation_by_category[catName] = { quantity: 0, value: 0 };
            }
            valuation_by_category[catName].quantity += qty;
            valuation_by_category[catName].value += value;
        });

        return {
            total_stock_value,
            valuation_by_category
        };
    }

    async getFinancialYearSummary(yearStr) {
        const pnl = await this.getProfitAndLoss(yearStr);
        const { startDate, endDate } = this._getFinancialYearDates(yearStr);
        
        const gst_collected = await Sale.sum('gst_amount', {
            where: { date: { [Op.between]: [startDate, endDate] } }
        }) || 0;

        const inventory = await this.getInventoryValuation();

        // Top selling products & Dead stock (Naive approach for simplicity)
        const saleItems = await SaleItem.findAll({
            include: [{
                model: Sale,
                where: { date: { [Op.between]: [startDate, endDate] } },
                attributes: []
            }, {
                model: Product,
                attributes: ['part_number', 'description']
            }]
        });

        const productSales = {};
        saleItems.forEach(item => {
            const pid = item.Product?.part_number || item.productId;
            productSales[pid] = (productSales[pid] || 0) + item.quantity;
        });

        const sortedProducts = Object.entries(productSales).sort((a, b) => b[1] - a[1]);
        const top_selling = sortedProducts.slice(0, 5).map(i => ({ product: i[0], quantity: i[1] }));
        
        return {
            financial_year: yearStr,
            total_sales: pnl.total_sales,
            total_purchases: pnl.total_purchases,
            net_profit: pnl.net_profit,
            inventory_value: inventory.total_stock_value,
            gst_collected,
            top_selling_products: top_selling,
            dead_stock_items: [] // Placeholder
        };
    }
}

module.exports = new FinancialReportService();
