require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5001; // Changed to 5001 to avoid potential conflict

async function startServer() {
    console.log('Starting server initialization...');
    try {
        console.log('Syncing database...');
        // Sync Database (alter: false to prevent startup crashes on SQLite constraints)
        // We handle schema updates via specific scripts (e.g., backend/scripts/sync_db.js) when needed.
        await sequelize.sync({ alter: false });
        console.log('Database connected and synced.');

        console.log(`Attempting to listen on port ${PORT}...`);
        const server = app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });

        server.on('error', (err) => {
            console.error('Server failed to start:', err);
        });

    } catch (error) {
        console.error('Unable to connect to the database or start server:', error);
    }
}

startServer();
