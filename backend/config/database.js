const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database/inventory.sqlite'),
  logging: false, // Set to console.log to see SQL queries
  // dialectOptions: {
  //   // WAL mode for better performance and concurrency
  //   mode: 'WAL', 
  // },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;
