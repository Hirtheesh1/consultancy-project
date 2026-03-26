const { sequelize } = require('../models');

async function inspectTables() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const [results, metadata] = await sequelize.query("SELECT * FROM PurchaseItems");
        console.log(`Total PurchaseItems: ${results.length}`);
        if (results.length > 0) {
            console.log('Sample PurchaseItem:', results[0]);
            console.log('Column Names:', Object.keys(results[0]));
        } else {
            console.log('PurchaseItems table is EMPTY.');
        }

        const [purchases] = await sequelize.query("SELECT * FROM Purchases ORDER BY createdAt DESC LIMIT 5");
        console.log('Recent Purchases:', purchases.map(p => ({
            id: p.id,
            invoice: p.invoice_number,
            date: p.purchase_date
        })));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

inspectTables();
