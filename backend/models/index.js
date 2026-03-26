const sequelize = require('../config/database');

const User = require('./User');
const Category = require('./Category');
const Brand = require('./Brand');
const Supplier = require('./Supplier');
const Product = require('./Product');
const Sale = require('./Sale');
const SaleItem = require('./SaleItem');
const Purchase = require('./Purchase');
const PurchaseItem = require('./PurchaseItem');
const StockHistory = require('./StockHistory');
const ShopProfile = require('./ShopProfile');
const Customer = require('./Customer');

// Associations

// Product Relations
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

Brand.hasMany(Product, { foreignKey: 'brandId' });
Product.belongsTo(Brand, { foreignKey: 'brandId' });

Supplier.hasMany(Product, { foreignKey: 'supplierId' });
Product.belongsTo(Supplier, { foreignKey: 'supplierId' });

// Sale Relations
Sale.hasMany(SaleItem, { foreignKey: 'saleId', onDelete: 'CASCADE' });
SaleItem.belongsTo(Sale, { foreignKey: 'saleId' });

Product.hasMany(SaleItem, { foreignKey: 'productId' });
SaleItem.belongsTo(Product, { foreignKey: 'productId' });

// Purchase Relations
Supplier.hasMany(Purchase, { foreignKey: 'supplierId' });
Purchase.belongsTo(Supplier, { foreignKey: 'supplierId' });

Purchase.hasMany(PurchaseItem, { foreignKey: 'purchaseId', onDelete: 'CASCADE' });
PurchaseItem.belongsTo(Purchase, { foreignKey: 'purchaseId' });

Product.hasMany(PurchaseItem, { foreignKey: 'productId' });
PurchaseItem.belongsTo(Product, { foreignKey: 'productId' });

// Stock History Relations
Product.hasMany(StockHistory, { foreignKey: 'productId' });
StockHistory.belongsTo(Product, { foreignKey: 'productId' });

// Customer Relations
Customer.hasMany(Sale, { foreignKey: 'customerId' });
Sale.belongsTo(Customer, { foreignKey: 'customerId' });

module.exports = {
    sequelize,
    User,
    Category,
    Brand,
    Supplier,
    Product,
    Sale,
    SaleItem,
    Purchase,
    PurchaseItem,
    StockHistory,
    ShopProfile,
    Customer
};
