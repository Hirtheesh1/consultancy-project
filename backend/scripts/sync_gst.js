const { sequelize } = require('../models');

async function sync() {
    try {
        console.log('Syncing GST related models...');
        const { Sale, Purchase } = require('../models');
        await Sale.sync({ alter: true });
        await Purchase.sync({ alter: true });
        console.log('Models synced successfully.');
    } catch (error) {
        console.error('Sync failed:', error);
    } finally {
        await sequelize.close();
    }
}

sync();
