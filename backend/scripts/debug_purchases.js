const fs = require('fs');
const { Purchase, PurchaseItem, Product, sequelize } = require('../models');

async function debugPurchases() {
    const logFile = 'backend/debug_log.txt';
    try {
        if (fs.existsSync(logFile)) fs.unlinkSync(logFile);

        const log = (msg) => {
            fs.appendFileSync(logFile, msg + '\n');
            console.log(msg);
        };

        await sequelize.authenticate();
        log('Database connected.');

        // Enable global logging
        sequelize.options.logging = (msg) => {
            fs.appendFileSync(logFile, '[SQL] ' + msg + '\n');
        };

        log('Checking PurchaseItem schema using raw query (PRAGMA)...');
        const [schema] = await sequelize.query("PRAGMA table_info(PurchaseItems);");
        log('Schema: ' + JSON.stringify(schema, null, 2));

        log('Querying top 5 purchases with include...');
        const purchases = await Purchase.findAll({
            include: [{
                model: PurchaseItem,
                include: [Product]
            }],
            order: [['purchase_date', 'DESC']],
            limit: 5
        });

        if (purchases.length > 0) {
            purchases.forEach(p => {
                log(`Purchase ID: ${p.id}, Date: ${p.purchase_date}, Items: ${p.PurchaseItems ? p.PurchaseItems.length : 0}`);
                if (p.PurchaseItems) {
                    p.PurchaseItems.forEach(i => {
                        log(`  - Item ID: ${i.id}, Product ID: ${i.productId}, Product Loaded: ${!!i.Product}`);
                        if (i.Product) {
                            log(`    - Part No: ${i.Product.part_number}, Desc: ${i.Product.description}`);
                        }
                    });
                }
            });
        } else {
            log('No purchases found.');
        }

    } catch (error) {
        fs.appendFileSync(logFile, 'Error: ' + error.stack + '\n');
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

debugPurchases();
