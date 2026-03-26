const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PurchaseItem = sequelize.define('PurchaseItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    purchaseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'purchaseId'
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'productId'
    }
}, {
    tableName: 'PurchaseItems'
});

module.exports = PurchaseItem;
