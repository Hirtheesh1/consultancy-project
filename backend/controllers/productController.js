const { Product, Category, Brand, Supplier } = require('../models');
const { Sequelize, Op } = require('sequelize');
const aiService = require('../services/aiService');

exports.getAllProducts = async (req, res) => {
    try {
        const { page = 1, limit = 50, search, ai_search, categoryId, brandId } = req.query;

        // Hard limit enforcement
        const pageSize = Math.min(parseInt(limit), 50);
        const offset = (page - 1) * pageSize;

        const where = {};
        if (search) {
            let actualSearchTerm = search;
            
            // AI Semantic Search interception
            if (ai_search === 'true') {
                actualSearchTerm = await aiService.extractSearchKeywords(search);
                // Optionally log the translation for debugging
                console.log(`AI Search Translation: "${search}" -> "${actualSearchTerm}"`);
            }

            where[Op.or] = [
                { part_number: { [Op.like]: `%${actualSearchTerm}%` } },
                { description: { [Op.like]: `%${actualSearchTerm}%` } },
                { oe_part_number: { [Op.like]: `%${actualSearchTerm}%` } }
            ];
        }
        if (categoryId) where.categoryId = categoryId;
        if (brandId) where.brandId = brandId;

        const { count, rows } = await Product.findAndCountAll({
            where,
            include: [Category, Brand, Supplier],
            limit: pageSize,
            offset,
            order: [['part_number', 'ASC']]
        });

        res.json({
            total: count,
            products: rows,
            totalPages: Math.ceil(count / pageSize),
            currentPage: parseInt(page)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [Category, Brand, Supplier]
        });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        // Basic validation is handled by Sequelize Model (unique part_number), 
        // but explicit check is good for user feedback.
        const { part_number, model_application, position } = req.body;
        const existing = await Product.findOne({ where: { part_number } });
        if (existing) {
            return res.status(400).json({ error: 'Part Number already exists' });
        }

        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        await product.update(req.body);
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        // Safety check: Prevent delete if stock > 0? optional, but good practice.
        // User requested "Confirm before DELETE", which is UI side, but API can enforce strictness.

        await product.destroy();
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
