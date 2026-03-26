const fs = require('fs');
const { sequelize, PurchaseItem, Purchase } = require('../models');

async function atomicDebug() {
    const logFile = 'backend/atomic_debug.log';
    if (fs.existsSync(logFile)) fs.unlinkSync(logFile);
    const log = (m) => { try { fs.appendFileSync(logFile, m + '\n'); } catch (e) { } console.log(m); };

    try {
        // sequelize.options.logging = console.log; // Disable verbose logging
        log('Path: ' + sequelize.options.storage);

        // 1. Raw count
        const [c] = await sequelize.query('SELECT count(*) as count FROM PurchaseItems');
        log('Raw Total Items: ' + c[0].count);

        // 2. Count IDs
        const [ids] = await sequelize.query('SELECT id, purchaseId FROM PurchaseItems');
        log('All Raw IDs: ' + ids.map(i => `${i.id}(pid:${i.purchaseId})`).join(', '));

        // 3. Model Request
        const allItems = await PurchaseItem.findAll({ raw: true });
        log('Model Total Items: ' + allItems.length);
        if (allItems.length > 0) {
            log('Model IDs: ' + allItems.map(i => i.id).join(', '));
            log('First Item Raw: ' + JSON.stringify(allItems[0]));
        }

        // 4. Create New
        const newItem = await PurchaseItem.create({
            purchaseId: 1,
            productId: 14,
            quantity: 1,
            unit_price: 100,
            total_price: 100
        });
        log('Created New Item ID: ' + newItem.id);

        // 5. Model Request Again
        const allItemsAfter = await PurchaseItem.findAll({ raw: true });
        log('Model Total Items (After): ' + allItemsAfter.length);
        log('Model IDs (After): ' + allItemsAfter.map(i => i.id).join(', '));

        await newItem.destroy();

    } catch (e) { log(e.stack); }
    finally { await sequelize.close(); }
}

atomicDebug();
