const { Sale, Purchase, SaleItem, PurchaseItem, Product, Category, Brand, Supplier, sequelize } = require('../models');
const { Op } = require('sequelize');

class GstReportService {
    
    async getSalesSummary(startDate, endDate) {
        let where = {};
        if (startDate && endDate) {
            const end = new Date(endDate);
            end.setUTCHours(23, 59, 59, 999);
            where.date = { [Op.between]: [new Date(startDate), end] };
        }

        const sales = await Sale.findAll({
            where,
            include: [{
                model: SaleItem,
                include: [{
                    model: Product,
                    include: [Category, Brand]
                }]
            }]
        });

        const summary = {
            total_sales: 0,
            total_taxable_value: 0,
            total_gst_collected: 0,
            total_invoices: sales.length,
            sales_by_category: {},
            sales_by_brand: {}
        };

        sales.forEach(sale => {
            summary.total_sales += parseFloat(sale.grand_total || 0);
            summary.total_taxable_value += parseFloat(sale.taxable_value || sale.sub_total || 0);
            summary.total_gst_collected += parseFloat(sale.gst_amount || sale.tax_amount || 0);

            // Item level category/brand aggregations
            if (sale.SaleItems) {
                sale.SaleItems.forEach(item => {
                    const lineTotal = parseFloat(item.total_price || 0);
                    const catName = item.Product?.Category?.name || 'Uncategorized';
                    const brandName = item.Product?.Brand?.name || 'Unbranded';
                    
                    summary.sales_by_category[catName] = (summary.sales_by_category[catName] || 0) + lineTotal;
                    summary.sales_by_brand[brandName] = (summary.sales_by_brand[brandName] || 0) + lineTotal;
                });
            }
        });

        return summary;
    }

    async getPurchaseSummary(startDate, endDate) {
        let where = {};
        if (startDate && endDate) {
            const end = new Date(endDate);
            end.setUTCHours(23, 59, 59, 999);
            where.purchase_date = { [Op.between]: [new Date(startDate), end] };
        }

        const purchases = await Purchase.findAll({
            where,
            include: [{
                model: PurchaseItem,
                include: [{
                    model: Product,
                    include: [Category, Brand]
                }]
            }]
        });

        const summary = {
            total_purchases: 0,
            total_taxable_value: 0,
            total_gst_paid: 0,
            purchase_count: purchases.length,
            supplier_wise_totals: {},
            purchases_by_category: {},
            purchases_by_brand: {}
        };

        purchases.forEach(purchase => {
            const supplier = purchase.supplier_name || 'Unknown Supplier';
            const total = parseFloat(purchase.total_amount || 0);
            const gst = parseFloat(purchase.gst_amount || 0);
            const taxable = parseFloat(purchase.taxable_value || total);

            summary.total_purchases += total;
            summary.total_taxable_value += taxable;
            summary.total_gst_paid += gst;

            summary.supplier_wise_totals[supplier] = (summary.supplier_wise_totals[supplier] || 0) + total;

            if (purchase.PurchaseItems) {
                purchase.PurchaseItems.forEach(item => {
                    const lineTotal = parseFloat(item.total_price || (item.quantity * item.unit_price) || 0);
                    const catName = item.Product?.Category?.name || 'Uncategorized';
                    const brandName = item.Product?.Brand?.name || 'Unbranded';
                    
                    summary.purchases_by_category[catName] = (summary.purchases_by_category[catName] || 0) + lineTotal;
                    summary.purchases_by_brand[brandName] = (summary.purchases_by_brand[brandName] || 0) + lineTotal;
                });
            }
        });

        return summary;
    }

    async getGSTSummary(startDate, endDate) {
        let saleWhere = {};
        let purchaseWhere = {};

        if (startDate && endDate) {
            const end = new Date(endDate);
            end.setUTCHours(23, 59, 59, 999);
            saleWhere.date = { [Op.between]: [new Date(startDate), end] };
            purchaseWhere.purchase_date = { [Op.between]: [new Date(startDate), end] };
        }

        const sales = await Sale.findAll({ where: saleWhere });
        const purchases = await Purchase.findAll({ where: purchaseWhere });

        let total_taxable_sales = 0;
        let total_gst_collected = 0;
        let total_gst_paid = 0;

        // Grouping by Month
        const monthly_data = {};

        sales.forEach(sale => {
            const date = new Date(sale.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            const taxable = parseFloat(sale.taxable_value || sale.sub_total || 0);
            const gst = parseFloat(sale.gst_amount || sale.tax_amount || 0);

            total_taxable_sales += taxable;
            total_gst_collected += gst;

            if (!monthly_data[monthKey]) {
                monthly_data[monthKey] = { taxable_sales: 0, gst_collected: 0, gst_paid: 0, net_gst: 0 };
            }
            monthly_data[monthKey].taxable_sales += taxable;
            monthly_data[monthKey].gst_collected += gst;
            monthly_data[monthKey].net_gst += gst;
        });

        purchases.forEach(purchase => {
            const date = new Date(purchase.purchase_date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            const gst = parseFloat(purchase.gst_amount || 0);
            total_gst_paid += gst;

            if (!monthly_data[monthKey]) {
                monthly_data[monthKey] = { taxable_sales: 0, gst_collected: 0, gst_paid: 0, net_gst: 0 };
            }
            monthly_data[monthKey].gst_paid += gst;
            monthly_data[monthKey].net_gst -= gst;
        });

        const net_gst = total_gst_collected - total_gst_paid;

        return {
            total_taxable_sales,
            total_gst_collected,
            total_gst_paid,
            net_gst_payable: Math.max(0, net_gst),
            input_tax_credit: Math.max(0, -net_gst),
            monthly_data
        };
    }
}

module.exports = new GstReportService();
