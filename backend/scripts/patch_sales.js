const { sequelize } = require('../models');

async function patchSales() {
    try {
        console.log('Checking Sales table...');
        const [results] = await sequelize.query("PRAGMA table_info(Sales);");
        const columns = results.map(c => c.name);
        console.log('Current columns:', columns);

        if (!columns.includes('vehicle_model')) {
            console.log('Adding vehicle_model...');
            await sequelize.query('ALTER TABLE Sales ADD COLUMN vehicle_model TEXT;');
        } else {
            console.log('vehicle_model already exists.');
        }

        if (!columns.includes('vehicle_number')) {
            console.log('Adding vehicle_number...');
            await sequelize.query('ALTER TABLE Sales ADD COLUMN vehicle_number TEXT;');
        } else {
            console.log('vehicle_number already exists.');
        }

    } catch (error) {
        console.error('Patch Failed:', error);
    }
}

patchSales();
