const { sequelize } = require('../models');

async function alterDB() {
    try {
        console.log('Adding specific columns to Sales...');
        await sequelize.query('ALTER TABLE Sales ADD COLUMN taxable_value DECIMAL(10, 2) DEFAULT 0.00;');
        await sequelize.query('ALTER TABLE Sales ADD COLUMN gst_rate DECIMAL(5, 2) DEFAULT 0.00;');
        await sequelize.query('ALTER TABLE Sales ADD COLUMN gst_amount DECIMAL(10, 2) DEFAULT 0.00;');
        await sequelize.query('ALTER TABLE Sales ADD COLUMN total_invoice_value DECIMAL(10, 2) DEFAULT 0.00;');
        
        console.log('Adding specific columns to Purchases...');
        await sequelize.query('ALTER TABLE Purchases ADD COLUMN taxable_value DECIMAL(10, 2) DEFAULT 0.00;');
        await sequelize.query('ALTER TABLE Purchases ADD COLUMN gst_rate DECIMAL(5, 2) DEFAULT 0.00;');
        await sequelize.query('ALTER TABLE Purchases ADD COLUMN gst_amount DECIMAL(10, 2) DEFAULT 0.00;');
        await sequelize.query('ALTER TABLE Purchases ADD COLUMN total_purchase_value DECIMAL(10, 2) DEFAULT 0.00;');

        console.log('Successfully altered database.');
    } catch (err) {
        console.warn('Columns might already exist or error:', err.message);
    } finally {
        await sequelize.close();
    }
}

alterDB();
