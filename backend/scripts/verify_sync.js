const { sequelize } = require('../models');

async function verifySync() {
    try {
        console.log('Attempting to sync database...');
        await sequelize.sync({ alter: true });
        console.log('Database sync successful!');
    } catch (error) {
        console.error('Sync failed:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

verifySync();
