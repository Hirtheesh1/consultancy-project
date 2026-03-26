const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.post('/', customerController.createCustomer);
router.get('/', customerController.getCustomers);
router.get('/:id', customerController.getCustomerById);
router.put('/:id', customerController.updateCustomer);
router.post('/:id/payment', customerController.addPayment);
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
