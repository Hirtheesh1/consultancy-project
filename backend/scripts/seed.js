const { sequelize, User, Category, Brand, Product, Supplier } = require('../models');

async function seed() {
    try {
        await sequelize.sync({ force: true }); // WARNING: This drops all tables
        console.log('Database synced!');

        // 1. Create Admin User
        await User.create({
            username: 'admin',
            password: 'password123', // In production, hash this!
            role: 'admin'
        });
        console.log('Admin user created');

        // 2. Create Categories
        const categories = await Category.bulkCreate([
            { name: 'Leaf Springs' },
            { name: 'Brake Drums' },
            { name: 'Windshields / Glass' },
            { name: 'SH Plates' },
            { name: 'Folding Type' },
            { name: 'Double Hole Components' }
        ]);
        console.log('Categories seeded');

        // 3. Create Brands
        const brands = await Brand.bulkCreate([
            { name: 'TATA' },
            { name: 'Leyland' },
            { name: 'Volvo' },
            { name: 'Tractor' },
            { name: 'Honda' },
            { name: 'Toyota' },
            { name: 'Skoda' },
            { name: 'Nissan' },
            { name: 'GM' },
            { name: 'Ford' }
        ]);
        console.log('Brands seeded');

        // 4. Create Supplier
        const supplier = await Supplier.create({
            name: 'AutoParts Distributor Inc.',
            contact_person: 'John Doe',
            phone: '9876543210',
            email: 'supply@autoparts.com',
            address: '123 Industrial Area, City'
        });
        console.log('Supplier seeded');

        // 5. Create Dummy Product
        await Product.create({
            part_number: 'LP-TATA-001',
            description: 'TATA Leaf Spring Front',
            variant: '10 Leaves',
            specification: 'Standard',
            purchase_price: 1500.00,
            selling_price: 2200.00,
            stock_quantity: 50,
            categoryId: categories[0].id,
            brandId: brands[0].id,
            supplierId: supplier.id
        });
        console.log('Dummy product seeded');

        console.log('Seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
