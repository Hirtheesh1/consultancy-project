const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShopProfile = sequelize.define('ShopProfile', {
    shop_name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'My Shop'
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: ''
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    gstin: {
        type: DataTypes.STRING,
        allowNull: true
    },
    logo_url: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = ShopProfile;
