const http = require('http');

function makeRequest(data) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5002,
            path: '/api/customers',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                resolve({ statusCode: res.statusCode, body: JSON.parse(body || '{}') });
            });
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

async function verifyApiError() {
    try {
        const uniqueId = Date.now();
        console.log(`Creating initial customer with phone: ${uniqueId}`);

        const customerData = JSON.stringify({
            name: `API Debugger ${uniqueId}`,
            phone: `${uniqueId}`,
            vehicle_number: `API-${uniqueId}`,
            address: 'API Address'
        });

        // 1. Create Successful Customer
        const res1 = await makeRequest(customerData);
        console.log(`Creation 1 Status: ${res1.statusCode}`);
        if (res1.statusCode !== 201) throw new Error('First creation failed');

        // 2. Try Duplicate
        console.log('Attempting to create duplicate...');
        const res2 = await makeRequest(customerData);
        console.log(`Creation 2 Status: ${res2.statusCode}`);
        console.log(`Error Message: ${res2.body.error}`);

        if (res2.statusCode !== 400) throw new Error(`Expected status 400, got ${res2.statusCode}`);
        if (res2.body.error !== 'Phone number already exists') throw new Error(`Expected specific error message, got: ${res2.body.error}`);

        console.log('SUCCESS: API returns correct error message!');

    } catch (error) {
        console.error('Verification Failed:', error);
    }
}

verifyApiError();
