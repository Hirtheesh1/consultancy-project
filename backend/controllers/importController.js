const { Product, Category, Brand, Supplier } = require('../models');
const { Op } = require('sequelize');

// Helper to find or create category/brand
async function findOrCreate(model, name) {
    if (!name) return null;
    const [item] = await model.findOrCreate({ where: { name } });
    return item.id;
}

exports.importCatalogData = async (req, res) => {
    /* 
    Expected Input JSON Structure:
    [
        {
            "category": "Glass",
            "brand": "AIS",
            "model_application": "JCB 3DX",
            "position": "Laminated Windshield", // Mapped from "Laminated Windshield" -> position/desc
            "part_number": "JCB-3DX-WIND", // Generated or provided
            "description": "Laminated Windshield for JCB 3DX",
            "price": 5150
        },
        ...
    ]
    */
    try {
        const { products } = req.body;
        if (!products || !Array.isArray(products)) {
            return res.status(400).json({ error: 'Invalid data format. Expected { products: [] }' });
        }

        let createdCount = 0;
        let updatedCount = 0;
        let errors = [];

        for (const item of products) {
            try {
                // 1. Resolve Categorization
                const categoryId = await findOrCreate(Category, item.category);
                const brandId = await findOrCreate(Brand, item.brand);

                // 2. Prepare Product Data
                const productData = {
                    part_number: item.part_number,
                    oe_part_number: item.oe_part_number || null,
                    description: item.description,
                    model_application: item.model_application || null,
                    position: item.position || null,
                    specification: item.specification || null, // Dimensions
                    purchase_price: item.price || 0,
                    selling_price: item.price || 0, // Defaulting selling to MRP for now
                    categoryId,
                    brandId,
                    stock_quantity: 0 // Default
                };

                // 3. Upsert Product
                // Check if exists by part_number
                let product = await Product.findOne({ where: { part_number: item.part_number } });

                if (product) {
                    await product.update(productData);
                    updatedCount++;
                } else {
                    await Product.create(productData);
                    createdCount++;
                }
            } catch (err) {
                console.error(`Error importing item ${item.part_number}:`, err);
                errors.push({ part_number: item.part_number, error: err.message });
            }
        }

        res.json({
            message: 'Import completed',
            created: createdCount,
            updated: updatedCount,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Import Controller Error:', error);
        res.status(500).json({ error: 'Internal Server Error during import' });
    }
};
