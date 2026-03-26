const { sequelize } = require('../models');

async function inspectCategories() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const [results] = await sequelize.query("SELECT * FROM Categories");
        console.log('Categories Count:', results.length);
        console.log('Categories Data:', JSON.stringify(results, null, 2));

        // Check for duplicates
        const ids = results.map(r => r.id);
        const uniqueIds = new Set(ids);
        if (ids.length !== uniqueIds.size) {
            console.error('CRITICAL: Duplicate IDs found in Categories table!');
        } else {
            console.log('No duplicate IDs found.');
        }

    } catch (error) {
        console.error('Inspection failed:', error);
    } finally {
        await sequelize.close();
    }
}

inspectCategories();
