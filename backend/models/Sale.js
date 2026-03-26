const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sale = sequelize.define('Sale', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    invoice_number: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    customer_name: {
        type: DataTypes.STRING
    },
    customer_phone: {
        type: DataTypes.STRING
    },
    vehicle_model: {
        type: DataTypes.STRING,
        allowNull: true
    },
    vehicle_number: {
        type: DataTypes.STRING,
        allowNull: true
    },
    sub_total: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    tax_amount: {
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
    total_invoice_value: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    grand_total: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    payment_method: {
        type: DataTypes.STRING, // Cash, Card, UPI
        defaultValue: 'Cash'
    },
    status: {
        type: DataTypes.ENUM('OPEN', 'CLOSED'),
        defaultValue: 'OPEN'
    },
    type: {
        type: DataTypes.ENUM('SALE', 'PAYMENT', 'RETURN'),
        defaultValue: 'SALE'
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    customerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Customers',
            key: 'id'
        }
    }
}, {
    indexes: [
        {
            fields: ['date']
        },
        {
            unique: true,
            fields: ['invoice_number']
        }
    ]
});

module.exports = Sale;
