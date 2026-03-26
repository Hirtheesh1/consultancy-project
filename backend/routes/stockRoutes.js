const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

router.post('/adjust', stockController.adjustStock);
router.get('/history', stockController.getStockHistory);

module.exports = router;
