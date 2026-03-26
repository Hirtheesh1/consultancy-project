const { Product, SaleItem, Sale } = require('../models');
const { Sequelize, Op } = require('sequelize');

class InventoryService {

    /**
     * 1. Stock Classification (AI Logic)
     * Rules:
     * - Fast: > 20 sales in last 30 days
     * - Medium: 5-20 sales
     * - Slow: < 5 sales
     * - Dead: 0 sales
     */
    async classifyStock(productId) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const totalSold = await SaleItem.sum('quantity', {
            include: [{
                model: Sale,
                where: {
                    date: { [Op.gte]: thirtyDaysAgo }
                }
            }],
            where: { productId }
        }) || 0;

        let classification = 'Dead';
        if (totalSold > 20) classification = 'Fast';
        else if (totalSold >= 5) classification = 'Medium';
        else if (totalSold > 0) classification = 'Slow';

        return { productId, totalSold, classification };
    }

    /**
     * 2. Smart Reorder Level Calculation
     * Formula: (Avg Daily Sales * Lead Time) + Safety Stock
     * - Lead Time: Default 7 days (can be dynamic per supplier later)
     * - Safety Stock: 50% of Lead Time Demand
     */
    async calculateReorderLevel(productId) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const totalSold = await SaleItem.sum('quantity', {
            include: [{
                model: Sale,
                where: {
                    date: { [Op.gte]: thirtyDaysAgo }
                }
            }],
            where: { productId }
        }) || 0;

        const avgDailySales = totalSold / 30;
        const leadTime = 7; // Days
        const leadTimeDemand = avgDailySales * leadTime;
        const safetyStock = leadTimeDemand * 0.5;

        const reorderLevel = Math.ceil(leadTimeDemand + safetyStock);

        // Update Product Model
        await Product.update({ reorder_level: reorderLevel }, { where: { id: productId } });

        return reorderLevel;
    }

    /**
     * 3. Anomaly Detection
     * Flag if stock reduction > 20% of total stock in a single transaction (Manual Adjustment)
     * Or if Sales drop significantly compared to previous month
     */
    detectAnomaly(currentStock, quantityChanged) {
        const threshold = 0.20; // 20%
        if (Math.abs(quantityChanged) / (currentStock + Math.abs(quantityChanged)) > threshold) {
            return { isAnomaly: true, reason: 'High Volume Move' };
        }
        return { isAnomaly: false };
    }

    /**
     * Check Low Stock
     */
    async checkLowStock(productId) {
        const product = await Product.findByPk(productId);
        if (!product) return false;
        return product.stock_quantity <= product.reorder_level;
    }
}

module.exports = new InventoryService();
