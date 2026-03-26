const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StockHistory = sequelize.define('StockHistory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: DataTypes.ENUM('SALE', 'PURCHASE', 'ADJUSTMENT', 'RETURN'),
        allowNull: false
    },
    quantity_change: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    previous_stock: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    new_stock: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    reference_id: {
        type: DataTypes.STRING, // Invoice No or Purchase ID
    },
    reason: {
        type: DataTypes.STRING // For Adjustments
    },
    performed_by: {
        type: DataTypes.STRING // User ID or Name
    }
});

module.exports = StockHistory;
