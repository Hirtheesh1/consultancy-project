const { sequelize } = require('../models');

async function verifyData() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');
        console.log('Storage:', sequelize.options.storage);

        const [results] = await sequelize.query("SELECT * FROM PurchaseItems WHERE purchaseId = 1");
        console.log(`Items with purchaseId=1: ${results.length}`);
        if (results.length > 0) {
            console.log('First item:', results[0]);
        }

        const [all] = await sequelize.query("SELECT * FROM PurchaseItems");
        console.log(`Total items in table: ${all.length}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

verifyData();
