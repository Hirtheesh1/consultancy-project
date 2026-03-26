const { sequelize } = require('../models');

async function alterDB() {
    const queries = [
        'ALTER TABLE Sales ADD COLUMN taxable_value DECIMAL(10, 2) DEFAULT 0.00;',
        'ALTER TABLE Sales ADD COLUMN gst_rate DECIMAL(5, 2) DEFAULT 0.00;',
        'ALTER TABLE Sales ADD COLUMN gst_amount DECIMAL(10, 2) DEFAULT 0.00;',
        'ALTER TABLE Sales ADD COLUMN total_invoice_value DECIMAL(10, 2) DEFAULT 0.00;',
        'ALTER TABLE Purchases ADD COLUMN taxable_value DECIMAL(10, 2) DEFAULT 0.00;',
        'ALTER TABLE Purchases ADD COLUMN gst_rate DECIMAL(5, 2) DEFAULT 0.00;',
        'ALTER TABLE Purchases ADD COLUMN gst_amount DECIMAL(10, 2) DEFAULT 0.00;',
        'ALTER TABLE Purchases ADD COLUMN total_purchase_value DECIMAL(10, 2) DEFAULT 0.00;'
    ];

    for (const q of queries) {
        try {
            await sequelize.query(q);
            console.log('Executed:', q);
        } catch (e) {
            console.log('Skipped/Error on:', q, '-', e.message);
        }
    }
    await sequelize.close();
}

alterDB();
