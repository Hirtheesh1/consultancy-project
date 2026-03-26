const { sequelize } = require('../models');
const fs = require('fs');

async function checkSchema() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query("PRAGMA table_info(PurchaseItems);");
        const columns = results.map(c => `${c.name} (${c.type})`);
        fs.writeFileSync('backend/scripts/schema_output.txt', columns.join('\n'));
        console.log('Schema written to backend/scripts/schema_output.txt');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkSchema();
