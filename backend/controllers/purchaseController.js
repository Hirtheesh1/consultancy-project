const { Purchase, PurchaseItem, Product, StockHistory, sequelize } = require('../models');

exports.createPurchase = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { supplier_name, invoice_number, purchase_date, items, gst_rate } = req.body;

        let total_amount = 0;
        const final_gst_rate = parseFloat(gst_rate) || 0;

        // Validation loop
        for (const item of items) {
            const unitPrice = parseFloat(item.unit_price) || 0;
            const sellingPrice = parseFloat(item.selling_price) || 0;
            const unitPriceWithGst = unitPrice + (unitPrice * (final_gst_rate / 100));

            if (sellingPrice < unitPriceWithGst) {
                return res.status(400).json({ error: `Selling Price (₹${sellingPrice}) for ${item.part_number} cannot be lower than its Purchase Price incl. GST (₹${unitPriceWithGst.toFixed(2)})` });
            }
            total_amount += (unitPrice * parseInt(item.quantity));
        }

        const taxable_value = total_amount;
        const gst_amount = taxable_value * (final_gst_rate / 100);
        const total_purchase_value = taxable_value + gst_amount;

        const purchase = await Purchase.create({
            invoice_number,
            purchase_date: purchase_date || new Date(),
            total_amount: total_purchase_value,
            taxable_value: taxable_value,
            gst_rate: final_gst_rate,
            gst_amount: gst_amount,
            total_purchase_value: total_purchase_value,
            status: 'PAID',
            supplier_name: supplier_name
        }, { transaction: t });

        for (const item of items) {
            const product = await Product.findByPk(item.product_id, { transaction: t });

            if (!product) {
                throw new Error(`Product with ID ${item.product_id} not found`);
            }

            // Create Purchase Item
            await PurchaseItem.create({
                purchaseId: purchase.id,
                productId: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.quantity * item.unit_price
            }, { transaction: t });

            // Update Stock
            const oldStock = product.stock_quantity;
            const newStock = oldStock + parseInt(item.quantity);

            await product.update({
                stock_quantity: newStock,
                purchase_price: item.unit_price, // Update latest purchase price
                selling_price: item.selling_price || product.selling_price // Update selling price if provided
            }, { transaction: t });

            // Log History
            await StockHistory.create({
                ProductId: product.id,
                type: 'PURCHASE',
                quantity_change: item.quantity,
                previous_stock: oldStock,
                new_stock: newStock,
                reference_id: purchase.id.toString(), // storing purchase ID as string
                reason: `Purchase Invoice: ${invoice_number}`
            }, { transaction: t });
        }

        await t.commit();
        res.status(201).json(purchase);

    } catch (error) {
        await t.rollback();
        console.error('Purchase Error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.findAll({
            include: [{
                model: PurchaseItem,
                include: [Product]
            }],
            order: [['purchase_date', 'DESC']],
            limit: 100
        });
        res.json(purchases);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
