const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    part_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    oe_part_number: {
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    variant: {
        type: DataTypes.STRING // e.g., 7/8 holes, S-cam
    },
    specification: {
        type: DataTypes.STRING // e.g., 60mm x 6mm
    },
    model_application: {
        type: DataTypes.STRING, // e.g., "JCB 3DX", "TATA 1613"
        allowNull: true
    },
    position: {
        type: DataTypes.STRING, // e.g., "Front", "Rear", "LH", "RH"
        allowNull: true
    },
    glass_type: {
        type: DataTypes.ENUM('None', 'Clear', 'Tinted'),
        defaultValue: 'None'
    },
    purchase_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    selling_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    stock_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0 // Prevent negative stock at model level
        }
    },
    reorder_level: {
        type: DataTypes.INTEGER,
        defaultValue: 5
    },
    location: {
        type: DataTypes.STRING // Shelf/Rack location
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['part_number']
        },
        {
            fields: ['categoryId']
        },
        {
            fields: ['brandId']
        }
    ]
});

module.exports = Product;
