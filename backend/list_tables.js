const { sequelize } = require('./models');

async function listTables() {
    try {
        const tables = await sequelize.getQueryInterface().showAllSchemas();
        // For SQLite, showAllSchemas returns an array of objects like { name: 'TableName', ... }
        // or sometimes just an array of objects depending on the version/dialect.
        // Let's print the raw output first to be sure.
        console.log('Raw Tables Output:', JSON.stringify(tables, null, 2));

        // Alternatively, use a raw query which is more reliable for SQLite
        const [results] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table';");
        console.log('\n--- SQLite Master Tables ---');
        console.log(`Total Tables: ${results.length}`);
        results.forEach((row, index) => {
            console.log(`${index + 1}. ${row.name}`);
        });

    } catch (error) {
        console.error('Error listing tables:', error);
    } finally {
        await sequelize.close();
    }
}

listTables();
