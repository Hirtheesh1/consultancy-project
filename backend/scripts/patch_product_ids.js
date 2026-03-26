const { sequelize, PurchaseItem, Product } = require('../models');

async function patchProducts() {
    try {
        console.log('Path:', sequelize.options.storage);

        // Check Orphans
        const [orphans] = await sequelize.query('SELECT count(*) as count FROM PurchaseItems WHERE productId IS NULL');
        console.log('Items with NULL productId:', orphans[0].count);

        if (orphans[0].count > 0) {
            // Find a valid product
            const product = await Product.findOne();
            if (product) {
                console.log(`Assigning items to Product ID ${product.id} (${product.part_number})...`);
                await sequelize.query(`UPDATE PurchaseItems SET productId = ${product.id} WHERE productId IS NULL`);
                console.log('Patch complete.');
            } else {
                console.log('No product found to assign items to.');
            }
        } else {
            console.log('No items with NULL productId found.');
        }

    } catch (e) { console.error(e); }
    finally { await sequelize.close(); }
}

patchProducts();
