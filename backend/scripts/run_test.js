const fs = require('fs');
const path = require('path');
const { sequelize, Product, Purchase, PurchaseItem, StockHistory } = require('../models');

async function testPurchaseFlow() {
    const logFile = path.join(__dirname, 'test_result.log');
    const log = (msg) => {
        console.log(msg);
        fs.appendFileSync(logFile, msg + '\n');
    };

    // Clear log file
    fs.writeFileSync(logFile, '');

    try {
        log('Starting test...');
        // log('Syncing database...');
        // await sequelize.sync({ alter: true });

        log('Creating dummy product...');
        const product = await Product.create({
            part_number: 'TEST-PART-' + Date.now(),
            description: 'Test Product for Purchase Flow',
            purchase_price: 100,
            sale_price: 150,
            stock_quantity: 10,
            min_stock_level: 5,
            location: 'A1'
        });
        log('Product created: ' + JSON.stringify(product.toJSON()));

        const purchaseData = {
            supplier_name: 'Test Supplier',
            invoice_number: 'INV-' + Date.now(),
            purchase_date: new Date(),
            items: [
                {
                    product_id: product.id,
                    quantity: 5,
                    unit_price: 120
                }
            ]
        };

        log('Simulating Purchase Request...');
        const t = await sequelize.transaction();

        try {
            const { supplier_name, invoice_number, purchase_date, items } = purchaseData;
            let total_amount = 0;
            items.forEach(item => {
                total_amount += (parseFloat(item.unit_price) * parseInt(item.quantity));
            });

            const purchase = await Purchase.create({
                invoice_number,
                purchase_date: purchase_date || new Date(),
                total_amount,
                status: 'PAID',
                supplier_name: supplier_name
            }, { transaction: t });

            for (const item of items) {
                const prod = await Product.findByPk(item.product_id, { transaction: t });

                await PurchaseItem.create({
                    PurchaseId: purchase.id,
                    productId: item.product_id,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    total_price: item.quantity * item.unit_price
                }, { transaction: t });

                const oldStock = prod.stock_quantity;
                const newStock = oldStock + parseInt(item.quantity);

                await prod.update({
                    stock_quantity: newStock,
                    purchase_price: item.unit_price
                }, { transaction: t });

                await StockHistory.create({
                    productId: prod.id,
                    type: 'PURCHASE',
                    quantity_change: item.quantity,
                    previous_stock: oldStock,
                    new_stock: newStock,
                    reference_id: purchase.id.toString(),
                    reason: `Purchase Invoice: ${invoice_number}`
                }, { transaction: t });
            }
            await t.commit();
            log('Purchase transaction committed.');
        } catch (error) {
            await t.rollback();
            throw error;
        }

        // Verification
        const updatedProduct = await Product.findByPk(product.id);
        log('Updated Product Stock: ' + updatedProduct.stock_quantity);

        if (updatedProduct.stock_quantity !== 15) {
            log('FAILED: Stock verify failed.');
        } else {
            log('PASSED: Stock updated correctly.');
        }

    } catch (error) {
        log('Test failed message: ' + error.message);
        log('Test failed stack: ' + error.stack);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

testPurchaseFlow();
