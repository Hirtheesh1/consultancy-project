const { Customer, sequelize } = require('../models');

async function verifyDeletion() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // 1. Create a customer to delete
        const uniqueId = Date.now();
        const customer = await Customer.create({
            name: `Delete Candidate ${uniqueId}`,
            phone: `${uniqueId}`,
            vehicle_number: `DEL-${uniqueId}`,
            address: 'To be deleted'
        });
        console.log(`Created Customer ID: ${customer.id}`);

        // 2. Delete the customer
        console.log(`Deleting Customer ID: ${customer.id}...`);
        await customer.destroy();
        console.log('Delete operation completed.');

        // 3. Verify deletion
        const check = await Customer.findByPk(customer.id);
        if (!check) {
            console.log('SUCCESS: Customer not found in DB (Deleted).');
        } else {
            console.error('FAILURE: Customer still exists in DB!');
        }

    } catch (error) {
        console.error('Verification Failed:', error);
    } finally {
        await sequelize.close();
    }
}

verifyDeletion();
