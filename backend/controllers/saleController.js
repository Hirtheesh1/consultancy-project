const { Sale, SaleItem, Product, StockHistory, Customer, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.createSale = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { items, customer_name, customer_phone, vehicle_model, vehicle_number, payment_method, tax_amount, customerId, gst_rate } = req.body;

        let sub_total = 0;

        // 1. Validate Stock & Calculate Total
        for (const item of items) {
            const product = await Product.findByPk(item.productId, { transaction: t });

            if (!product) {
                throw new Error(`Product ID ${item.productId} not found`);
            }

            // STRICT NEGATIVE STOCK CHECK
            if (product.stock_quantity < item.quantity) {
                throw new Error(`Insufficient stock for ${product.part_number}. Requested: ${item.quantity}, Available: ${product.stock_quantity}`);
            }

            const price = parseFloat(product.selling_price);
            sub_total += price * item.quantity;
        }

        // 2. Create Sale Header
        const invoice_number = `INV-${Date.now()}`;
        
        // Calculate new GST fields
        const taxable_value = sub_total;
        const final_gst_rate = parseFloat(gst_rate) || 0;
        const gst_amount_calculated = taxable_value * (final_gst_rate / 100);
        
        // Either use computed GST or provided tax_amount for backwards compatibility
        const final_tax_amount = parseFloat(tax_amount) || gst_amount_calculated;
        const total_invoice_value = taxable_value + final_tax_amount;
        const grand_total = total_invoice_value;

        const salePayload = {
            invoice_number,
            customer_name,
            customer_phone,
            vehicle_model,
            vehicle_number,
            sub_total,
            tax_amount: final_tax_amount,
            grand_total,
            taxable_value: taxable_value,
            gst_rate: final_gst_rate,
            gst_amount: final_tax_amount,
            total_invoice_value: total_invoice_value,
            payment_method,
            date: new Date()
        };

        if (customerId) {
            salePayload.customerId = customerId;
        }

        const sale = await Sale.create(salePayload, { transaction: t });

        // 3. Update Customer Credit & Spend
        if (customerId) {
            const customer = await Customer.findByPk(customerId, { transaction: t });
            if (customer) {
                let newCredit = parseFloat(customer.total_credit);

                if (payment_method === 'Credit' || payment_method === 'Udhaari') {
                    newCredit += grand_total;
                }

                const newSpend = parseFloat(customer.total_spend) + grand_total;

                await customer.update({
                    total_credit: newCredit,
                    total_spend: newSpend
                }, { transaction: t });
            }
        }

        // 4. Create Sale Items & Deduct Stock
        for (const item of items) {
            const product = await Product.findByPk(item.productId, { transaction: t });

            // Deduct Stock
            const newStock = product.stock_quantity - item.quantity;
            await product.update({ stock_quantity: newStock }, { transaction: t });

            // Create Sale Item
            await SaleItem.create({
                saleId: sale.id,
                productId: item.productId,
                quantity: item.quantity,
                unit_price: product.selling_price,
                total_price: product.selling_price * item.quantity
            }, { transaction: t });

            // Log Stock History
            await StockHistory.create({
                type: 'SALE',
                quantity_change: -item.quantity,
                previous_stock: product.stock_quantity,
                new_stock: newStock,
                reference_id: sale.invoice_number,
                performed_by: 'System',
                productId: product.id
            }, { transaction: t });
        }

        await t.commit();
        res.status(201).json(sale);

    } catch (error) {
        await t.rollback();
        console.error('Create Sale Error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllSales = async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const pageSize = Math.min(parseInt(limit), 50);
        const offset = (page - 1) * pageSize;

        const { count, rows } = await Sale.findAndCountAll({
            include: [SaleItem],
            limit: pageSize,
            offset,
            order: [['date', 'DESC']]
        });

        res.json({
            total: count,
            sales: rows,
            totalPages: Math.ceil(count / pageSize),
            currentPage: parseInt(page)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSaleById = async (req, res) => {
    try {
        const sale = await Sale.findByPk(req.params.id, {
            include: [
                {
                    model: SaleItem,
                    include: [{ model: Product, attributes: ['part_number', 'description'] }]
                }
            ]
        });
        if (!sale) return res.status(404).json({ error: 'Sale not found' });
        res.json(sale);
    } catch (error) {
        console.error('Get Sale Error:', error);
        res.status(500).json({ error: error.message });
    }
};
