// Native fetch in Node 18+
// const fetch = require('node-fetch'); 

const API_URL = 'http://localhost:5001/api';

async function testInvoiceFetch() {
    try {
        console.log('1. Fetching products...');
        const prodRes = await fetch(`${API_URL}/products?limit=1`);
        const prodData = await prodRes.json();

        if (!prodData.products || prodData.products.length === 0) {
            console.error('No products found.');
            return;
        }
        const product = prodData.products[0];
        console.log(`Found product: ${product.part_number} (ID: ${product.id}, Price: ${product.selling_price})`);

        console.log('2. Creating Sale...');
        const salePayload = {
            items: [{ productId: product.id, quantity: 1 }],
            customer_name: "Debug User",
            customer_phone: "9999999999",
            payment_method: "Cash",
            tax_amount: 10
        };

        const createRes = await fetch(`${API_URL}/sales`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(salePayload)
        });

        const saleData = await createRes.json();
        if (!createRes.ok) {
            console.error('Create Sale Failed:', saleData);
            return;
        }
        console.log(`Sale Created! ID: ${saleData.id}, Invoice: ${saleData.invoice_number}`);

        console.log(`3. Fetching Invoice (ID: ${saleData.id})...`);
        const getRes = await fetch(`${API_URL}/sales/${saleData.id}`);

        if (!getRes.ok) {
            console.error(`Fetch Invoice Failed! Status: ${getRes.status} ${getRes.statusText}`);
            const errorText = await getRes.text();
            console.error('Error Body:', errorText);
        } else {
            const invoiceData = await getRes.json();
            console.log('Fetch Invoice Success!');
            // console.log('Invoice Data:', JSON.stringify(invoiceData, null, 2));
            console.log(`Invoice contains ${invoiceData.SaleItems ? invoiceData.SaleItems.length : 0} items.`);
        }

    } catch (error) {
        console.error('Test Exception:', error);
    }
}

testInvoiceFetch();
