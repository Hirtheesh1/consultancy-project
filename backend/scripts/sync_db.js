const { sequelize } = require('../models');

async function sync() {
    try {
        console.log('Syncing Purchase related models...');
        const { Purchase, PurchaseItem, StockHistory, Product } = require('../models');
        await Purchase.sync({ alter: true });
        await PurchaseItem.sync({ alter: true });
        await StockHistory.sync({ alter: true });
        await Product.sync({ alter: true });
        console.log('Purchase models synced successfully.');
    } catch (error) {
        console.error('Sync failed:', error);
    } finally {
        await sequelize.close();
    }
}

sync();
