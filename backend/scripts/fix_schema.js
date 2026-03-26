const { Customer, sequelize } = require('../models');

async function fixSchema() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // 1. Delete Test Customers to remove potential duplicates that block sync
        // Removing customers with phone '8888888888' or names starting with 'Report Closure Tester'
        const deleted = await Customer.destroy({
            where: {
                phone: '8888888888'
            }
        });
        console.log(`Deleted ${deleted} customers with phone 8888888888`);

        // 2. Manually Add Columns
        console.log('Adding "status" column...');
        try {
            await sequelize.query("ALTER TABLE Sales ADD COLUMN status TEXT DEFAULT 'OPEN';");
            console.log('"status" column added.');
        } catch (e) {
            console.log('"status" column might already exist:', e.message);
        }

        console.log('Adding "type" column...');
        try {
            await sequelize.query("ALTER TABLE Sales ADD COLUMN type TEXT DEFAULT 'SALE';");
            console.log('"type" column added.');
        } catch (e) {
            console.log('"type" column might already exist:', e.message);
        }

        console.log('Manual Schema Update Completed.');

    } catch (error) {
        console.error('Fix Failed:', error);
    } finally {
        await sequelize.close();
    }
}

fixSchema();
