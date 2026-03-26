const { Customer, sequelize } = require('../models');

async function verifyCustomerCreation() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const uniqueId = Date.now();
        console.log(`Attempting to create customer with phone: ${uniqueId}`);

        const customer = await Customer.create({
            name: `Debug Tester ${uniqueId}`,
            phone: `${uniqueId}`,
            vehicle_number: `TEST-${uniqueId}`,
            address: 'Debug Address'
        });

        console.log('Customer Created Successfully:', customer.toJSON());

        // Try creating duplicate to see error
        console.log('Attempting to create duplicate customer...');
        try {
            await Customer.create({
                name: `Debug Tester Duplicate`,
                phone: `${uniqueId}`, // Same phone
                vehicle_number: `TEST-DUP`,
                address: 'Debug Address'
            });
        } catch (e) {
            console.log('Expected Duplicate Error:', e.message);
        }

    } catch (error) {
        console.error('Customer Creation Failed:', error);
        if (error.errors) {
            error.errors.forEach(e => console.error(` - ${e.message} (${e.type})`));
        }
    } finally {
        await sequelize.close();
    }
}

verifyCustomerCreation();
