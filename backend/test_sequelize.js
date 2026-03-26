const { Sequelize } = require('sequelize');
const path = require('path');

const dbPath = path.join(__dirname, 'database/inventory.sqlite');
console.log('Using DB path:', dbPath);

// Minimal Sequelize instance
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: console.log, // Enable logging to see what happens
    dialectOptions: {
        // mode: 'WAL', // Disabling WAL to test if it's the culprit
    }
});

async function testConfig() {
    console.log('Testing authenticating...');
    try {
        await sequelize.authenticate();
        console.log('Authentication successful.');

        console.log('Testing sync...');
        await sequelize.sync({ force: false }); // Using force: false just to check connection
        console.log('Sync successful.');
    } catch (error) {
        console.error('Sequelize Error:', error);
    } finally {
        await sequelize.close();
    }
}

testConfig();
