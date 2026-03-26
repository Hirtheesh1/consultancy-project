const { sequelize, PurchaseItem, Purchase } = require('../models');

async function patchData() {
    try {
        console.log('Path:', sequelize.options.storage);

        // Check Orphans
        const [orphans] = await sequelize.query('SELECT count(*) as count FROM PurchaseItems WHERE purchaseId IS NULL');
        console.log('Orphan Items:', orphans[0].count);

        if (orphans[0].count > 0) {
            // Find a valid purchase
            const purchase = await Purchase.findOne({ order: [['id', 'DESC']] });
            if (purchase) {
                console.log(`Assigning orphans to Purchase ID ${purchase.id}...`);
                await sequelize.query(`UPDATE PurchaseItems SET purchaseId = ${purchase.id} WHERE purchaseId IS NULL`);
                console.log('Patch complete.');
            } else {
                console.log('No purchase found to assign items to.');
            }
        } else {
            console.log('No orphans found.');
        }

    } catch (e) { console.error(e); }
    finally { await sequelize.close(); }
}

patchData();
