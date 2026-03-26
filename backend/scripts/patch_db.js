const { sequelize } = require('../models');

async function updateSchema() {
    try {
        console.log('Altering Sales table...');
        await sequelize.query('ALTER TABLE Sales ADD COLUMN vehicle_model TEXT;');
        await sequelize.query('ALTER TABLE Sales ADD COLUMN vehicle_number TEXT;');
        console.log('Columns added successfully.');
    } catch (error) {
        if (error.message.includes('duplicate column')) {
            console.log('Columns already exist.');
        } else {
            console.error('Error adding columns:', error);
        }
    } finally {
        // Try standard sync just in case
        await sequelize.sync({ alter: true });
        console.log('Full Sync Complete');
    }
}

updateSchema();
