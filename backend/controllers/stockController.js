const { Product, StockHistory, sequelize } = require('../models');

exports.adjustStock = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { productId, quantity_change, reason, performed_by } = req.body;

        const product = await Product.findByPk(productId, { transaction: t });
        if (!product) return res.status(404).json({ error: 'Product not found' });

        const newStock = product.stock_quantity + parseInt(quantity_change);

        // Validate if negative stock is allowed? Usually adjustments can correct negatives, 
        // but resulting stock shouldn't be negative unless allowed.
        if (newStock < 0) {
            throw new Error(`Adjustment rejected. Resulting stock would be negative: ${newStock}`);
        }

        await product.update({ stock_quantity: newStock }, { transaction: t });

        await StockHistory.create({
            type: 'ADJUSTMENT',
            quantity_change: parseInt(quantity_change),
            previous_stock: product.stock_quantity,
            new_stock: newStock,
            reason,
            performed_by: performed_by || 'Admin', // Placeholder for User ID
            productId
        }, { transaction: t });

        await t.commit();
        res.json({ message: 'Stock adjusted successfully', newStock });
    } catch (error) {
        await t.rollback();
        res.status(400).json({ error: error.message });
    }
};

exports.getStockHistory = async (req, res) => {
    try {
        const { productId, page = 1, limit = 50 } = req.query;
        const pageSize = Math.min(parseInt(limit), 50);
        const offset = (page - 1) * pageSize;

        const where = {};
        if (productId) where.productId = productId;

        const { count, rows } = await StockHistory.findAndCountAll({
            where,
            include: [{ model: Product, attributes: ['part_number', 'description'] }],
            limit: pageSize,
            offset,
            order: [['createdAt', 'DESC']]
        });

        res.json({
            total: count,
            history: rows,
            totalPages: Math.ceil(count / pageSize),
            currentPage: parseInt(page)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
