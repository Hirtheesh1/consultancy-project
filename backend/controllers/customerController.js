const { Customer, Sale, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.createCustomer = async (req, res) => {
    try {
        const { name, phone, vehicle_number, address } = req.body;
        const customer = await Customer.create({ name, phone, vehicle_number, address });
        res.status(201).json(customer);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Phone number already exists' });
        }
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
        }
        res.status(400).json({ error: error.message });
    }
};

exports.getCustomers = async (req, res) => {
    try {
        const { search } = req.query;
        let where = {};
        if (search) {
            where = {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { phone: { [Op.like]: `%${search}%` } },
                    { vehicle_number: { [Op.like]: `%${search}%` } }
                ]
            };
        }
        const customers = await Customer.findAll({ where, order: [['name', 'ASC']] });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCustomerById = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = 'OPEN' } = req.query;
        const pageSize = parseInt(limit);
        const offset = (parseInt(page) - 1) * pageSize;

        const customer = await Customer.findByPk(req.params.id);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        const whereClause = { customerId: req.params.id };
        if (status !== 'ALL') {
            whereClause.status = status;
        }

        const { count, rows } = await Sale.findAndCountAll({
            where: whereClause,
            limit: pageSize,
            offset: offset,
            order: [['date', 'DESC']]
        });

        // Add sales data to customer object
        const customerData = customer.toJSON();
        customerData.Sales = rows;
        customerData.totalPages = Math.ceil(count / pageSize);
        customerData.currentPage = parseInt(page);
        customerData.totalSales = count;

        res.json(customerData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const { name, phone, vehicle_number, address } = req.body;
        const customer = await Customer.findByPk(req.params.id);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        await customer.update({ name, phone, vehicle_number, address });
        res.json(customer);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Add Payment (Settle Udhaari)
exports.addPayment = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { amount, payment_method } = req.body;
        const customer = await Customer.findByPk(req.params.id);
        if (!customer) throw new Error('Customer not found');

        // 1. Create Payment Transaction
        await Sale.create({
            invoice_number: `PAY-${Date.now()}`, // Unique ID for payment
            customerId: customer.id,
            total_amount: 0, // No sale value
            grand_total: parseFloat(amount), // Payment amount
            payment_method: payment_method || 'Cash',
            type: 'PAYMENT',
            status: 'OPEN',
            date: new Date()
        }, { transaction: t });

        // 2. Decrease credit (debt)
        const newCredit = parseFloat(customer.total_credit) - parseFloat(amount);
        await customer.update({ total_credit: newCredit }, { transaction: t });

        // 3. Check for Report Closure
        let message = 'Payment recorded';
        if (newCredit <= 0) {
            // Close all OPEN transactions for this customer
            await Sale.update(
                { status: 'CLOSED' },
                {
                    where: {
                        customerId: customer.id,
                        status: 'OPEN'
                    },
                    transaction: t
                }
            );
            message = 'Payment recorded & Report Closed (Due cleared)';
        }

        await t.commit();
        res.json({ message, new_balance: newCredit });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ error: error.message });
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        await customer.destroy();
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
