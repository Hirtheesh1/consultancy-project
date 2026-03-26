const { Customer, Sale, sequelize } = require('../models');

async function seedPaginationData() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Create a dummy customer
        const customer = await Customer.create({
            name: 'Pagination Tester',
            phone: '9999999999',
            vehicle_number: 'TEST-9999',
            address: 'Test Address'
        });

        console.log(`Created Customer: ${customer.name} (ID: ${customer.id})`);

        // Create 25 dummy sales
        const salesData = [];
        for (let i = 1; i <= 25; i++) {
            salesData.push({
                customerId: customer.id,
                invoice_number: `INV-TEST-${i}`,
                payment_method: i % 2 === 0 ? 'Cash' : 'Credit',
                grand_total: 100 * i,
                date: new Date(new Date().setDate(new Date().getDate() - i)), // varying dates
                vehicle_model: 'Test Model',
                vehicle_number: 'TEST-9999'
            });
        }

        await Sale.bulkCreate(salesData);
        console.log(`Created 25 sales for customer ${customer.id}`);

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await sequelize.close();
    }
}

seedPaginationData();
