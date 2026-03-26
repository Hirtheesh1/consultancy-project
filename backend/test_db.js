const { sequelize } = require('./models');

async function testConnection() {
    console.log('Testing connection...');
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        console.log('Testing sync...');
        await sequelize.sync({ alter: false });
        console.log('Sync completed.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

testConnection();
