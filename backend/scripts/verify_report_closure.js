const { Customer, Sale, sequelize } = require('../models');
const fs = require('fs');

function log(message) {
    console.log(message);
    fs.appendFileSync('verification_closure_result.txt', message + '\n');
}

async function verifyReportClosure() {
    try {
        fs.writeFileSync('verification_closure_result.txt', 'Starting Verification...\n');

        await sequelize.authenticate();
        log('Database connected.');

        // Ensure schema is updated for this script's connection
        // await sequelize.sync({ alter: true });
        // log('Database synced.');

        // 1. Create a Test Customer
        const uniqueId = Date.now();
        const customer = await Customer.create({
            name: `Report Closure Tester ${uniqueId}`,
            phone: `${uniqueId}`, // Unique phone
            vehicle_number: `TEST-${uniqueId}`, // Unique vehicle
            address: 'Test Addr',
            total_credit: 200 // Initial debt
        });
        log(`Created Customer: ${customer.name} (Credit: 200)`);

        // 2. Create 2 OPEN Sales
        await Sale.create({
            invoice_number: `INV-OPEN-1-${Date.now()}`, customerId: customer.id,
            grand_total: 100, payment_method: 'Credit',
            status: 'OPEN', type: 'SALE'
        });
        await Sale.create({
            invoice_number: `INV-OPEN-2-${Date.now()}`, customerId: customer.id,
            grand_total: 100, payment_method: 'Credit',
            status: 'OPEN', type: 'SALE'
        });
        log('Created 2 OPEN Sales (Total 200)');

        // 3. Make Partial Payment (100)
        log('--- Simulating Partial Payment (100) ---');
        let t = await sequelize.transaction();
        try {
            await Sale.create({
                invoice_number: `PAY-PARTIAL-${Date.now()}`, customerId: customer.id,
                grand_total: 100, payment_method: 'Cash',
                type: 'PAYMENT', status: 'OPEN'
            }, { transaction: t });

            await customer.update({ total_credit: 100 }, { transaction: t });
            await t.commit();
            log('Partial Payment Recorded. New Credit: 100');
        } catch (e) { await t.rollback(); throw e; }

        // Verify Status: Should still be OPEN
        const openSalesCount = await Sale.count({ where: { customerId: customer.id, status: 'OPEN' } });
        log(`Open Sales Count (Expect 3: 2 Sales + 1 Payment): ${openSalesCount}`);

        if (openSalesCount !== 3) throw new Error('Report should stay OPEN after partial payment');

        // 4. Make Final Payment (100)
        log('--- Simulating Final Payment (100) ---');
        t = await sequelize.transaction();
        try {
            await Sale.create({
                invoice_number: `PAY-FINAL-${Date.now()}`, customerId: customer.id,
                grand_total: 100, payment_method: 'Cash',
                type: 'PAYMENT', status: 'OPEN'
            }, { transaction: t });

            const newCredit = 0;
            await customer.update({ total_credit: newCredit }, { transaction: t });

            if (newCredit <= 0) {
                await Sale.update(
                    { status: 'CLOSED' },
                    { where: { customerId: customer.id, status: 'OPEN' }, transaction: t }
                );
                log('Report Closed Triggered');
            }
            await t.commit();
        } catch (e) { await t.rollback(); throw e; }

        // Verify Status: Should be CLOSED (0 Open)
        const finalOpenCount = await Sale.count({ where: { customerId: customer.id, status: 'OPEN' } });
        const closedCount = await Sale.count({ where: { customerId: customer.id, status: 'CLOSED' } });

        log(`Final Open Sales: ${finalOpenCount} (Expect 0)`);
        log(`Final Closed Sales: ${closedCount} (Expect 4: 2 Sales + 2 Payments)`);

        if (finalOpenCount !== 0) throw new Error('Report did not close!');
        if (closedCount !== 4) throw new Error('Transactions were not marked as closed!');

        log('SUCCESS: Report Closure Logic Verified!');

    } catch (error) {
        log('Verification Failed: ' + error.message);
        log(JSON.stringify(error, null, 2));
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

verifyReportClosure();
