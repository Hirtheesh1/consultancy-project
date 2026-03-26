const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');

// Routes
const productRoutes = require('./routes/productRoutes');
const saleRoutes = require('./routes/saleRoutes');
const stockRoutes = require('./routes/stockRoutes');
const reportRoutes = require('./routes/reportRoutes');
const financialReportRoutes = require('./routes/financialReportRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/financial-reports', financialReportRoutes);
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/purchases', require('./routes/purchaseRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));

// Import Route (Temporary/Admin only)
const importController = require('./controllers/importController');
app.post('/api/import', importController.importCatalogData);

// Backup Endpoint (Manual)
const fs = require('fs');
app.post('/api/backup', (req, res) => {
    try {
        const source = path.join(__dirname, 'database/inventory.sqlite');
        const destination = path.join(__dirname, `database/backup-${Date.now()}.sqlite`);
        fs.copyFileSync(source, destination);
        res.json({ message: 'Backup created successfully', path: destination });
    } catch (error) {
        res.status(500).json({ error: 'Backup failed: ' + error.message });
    }
});

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
