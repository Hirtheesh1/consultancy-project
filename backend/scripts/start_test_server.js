const app = require('../app');
const { sequelize } = require('../models');

const PORT = 5002;

async function startTestServer() {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: false });
        console.log('Database connected and synced.');

        const server = app.listen(PORT, () => {
            console.log(`Test Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start test server:', error);
    }
}

startTestServer();
