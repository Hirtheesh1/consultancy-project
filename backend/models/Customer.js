const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define('Customer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    vehicle_number: {
        type: DataTypes.STRING
    },
    address: {
        type: DataTypes.STRING
    },
    total_credit: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    total_spend: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    }
});

module.exports = Customer;
