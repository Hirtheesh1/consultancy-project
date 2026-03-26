const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Initialize Sequelize
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database/inventory.sqlite'), // Adjust path if needed
    logging: console.log
});

async function fixDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // list tables
        const [results, metadata] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table';");
        console.log('Current Tables:', results.map(r => r.name));

        // Check if Categories_backup exists and drop it
        const backupTable = results.find(r => r.name === 'Categories_backup');
        if (backupTable) {
            console.log('Found leftover backup table: Categories_backup. Dropping it...');
            await sequelize.query("DROP TABLE `Categories_backup`;");
            console.log('Dropped Categories_backup.');
        } else {
            console.log('No Categories_backup table found.');
        }

    } catch (error) {
        console.error('Error fixing database:', error);
    } finally {
        await sequelize.close();
    }
}

fixDatabase();
