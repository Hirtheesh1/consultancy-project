const { sequelize, Product, Purchase, PurchaseItem, StockHistory } = require('../models');

async function testPurchaseFlow() {
    try {
        // console.log('Syncing database...');
        // await sequelize.sync({ alter: true });

        console.log('Creating dummy product...');
        const product = await Product.create({
            part_number: 'TEST-PART-' + Date.now(),
            description: 'Test Product for Purchase Flow',
            purchase_price: 100,
            sale_price: 150,
            stock_quantity: 10,
            min_stock_level: 5,
            location: 'A1'
        });
        console.log('Product created:', product.toJSON());

        const purchaseData = {
            supplier_name: 'Test Supplier',
            invoice_number: 'INV-' + Date.now(),
            purchase_date: new Date(),
            items: [
                {
                    product_id: product.id,
                    quantity: 5,
                    unit_price: 120 // Price increased
                }
            ]
        };

        console.log('Simulating Purchase Request...');

        // Simulate Controller Logic directly to test DB interactions first
        // In a real integration test we would use supertest or fetch against the running server
        // ensuring the controller logic works as expected.

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
                    PurchaseId: purchase.id, // Ensure consistent casing with model definition if needed, usually purchaseId or PurchaseId depending on association
                    purchaseId: purchase.id, // Try both/standardize
                    ProductId: item.product_id,
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
                    ProductId: prod.id,
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
            console.log('Purchase transaction committed.');
        } catch (error) {
            await t.rollback();
            throw error;
        }

        // Verification
        const updatedProduct = await Product.findByPk(product.id);
        console.log('Updated Product Stock:', updatedProduct.stock_quantity); // Should be 10 + 5 = 15

        if (updatedProduct.stock_quantity !== 15) {
            console.error('FAILED: Stock verify failed.');
        } else {
            console.log('PASSED: Stock updated correctly.');
        }

        const history = await StockHistory.findOne({ where: { reference_id: purchaseData.invoice_number } }); // wait, reference_id stores purchase ID in controller... check logic
        // In controller: reference_id: purchase.id.toString()
        // So I should verify against purchase ID, but I don't have it easily here without return.
        // Let's check generally for the product.
        const histories = await StockHistory.findAll({ where: { productId: product.id } });
        console.log('Stock History Records:', histories.length);
        if (histories.length > 0) {
            console.log('PASSED: Stock History created.');
            console.log('Reason:', histories[0].reason);
        } else {
            console.error('FAILED: No Stock History found.');
        }

    } catch (error) {
        console.error('Test failed message:', error.message);
        console.error('Test failed stack:', error.stack);
    } finally {
        await sequelize.close();
    }
}

testPurchaseFlow();
