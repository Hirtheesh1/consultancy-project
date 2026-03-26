const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Purchase = sequelize.define('Purchase', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    invoice_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    supplier_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    purchase_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    taxable_value: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    gst_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00
    },
    gst_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    total_purchase_value: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    status: {
        type: DataTypes.STRING, // PAID, PENDING
        defaultValue: 'PAID'
    }
});

module.exports = Purchase;
