const { Product } = require('../models');

async function verify() {
    try {
        const products = await Product.findAll();
        console.log(`Found ${products.length} products:`);
        products.forEach(p => {
            console.log(`- [${p.part_number}] ${p.description} | Model: ${p.model_application} | Pos: ${p.position} | Spec: ${p.specification}`);
        });
    } catch (error) {
        console.error('Verify failed:', error);
    }
}

// Need to init sequelize first, which models/index.js does
verify();
