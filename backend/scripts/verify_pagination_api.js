const http = require('http');
const fs = require('fs');

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5001,
            path: path,
            method: 'GET',
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error('Failed to parse JSON response: ' + data));
                    }
                } else {
                    reject(new Error(`Request failed with status code ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.end();
    });
}

function log(message) {
    console.log(message);
    fs.appendFileSync('verification_result.txt', message + '\n');
}

async function verifyPagination() {
    try {
        fs.writeFileSync('verification_result.txt', 'Starting Verification...\n');

        const customerId = 3;
        const basePath = `/api/customers/${customerId}`;

        log(`Connecting to http://localhost:5001${basePath}?page=1&limit=10`);
        const data1 = await makeRequest(`${basePath}?page=1&limit=10`);

        log(`Page 1 Sales Count: ${data1.Sales.length}`);
        log(`Total Sales: ${data1.totalSales}`);
        log(`Total Pages: ${data1.totalPages}`);

        if (data1.Sales.length !== 10) throw new Error('Page 1 should have 10 sales');
        if (data1.currentPage !== 1) throw new Error('Current page should be 1');

        log('Testing Page 2 (Limit 10)...');
        const data2 = await makeRequest(`${basePath}?page=2&limit=10`);

        log(`Page 2 Sales Count: ${data2.Sales.length}`);

        if (data2.Sales.length !== 10) throw new Error('Page 2 should have 10 sales');
        if (data2.currentPage !== 2) throw new Error('Current page should be 2');

        const p1Ids = data1.Sales.map(s => s.id);
        const p2Ids = data2.Sales.map(s => s.id);
        const overlap = p1Ids.some(id => p2Ids.includes(id));

        if (overlap) throw new Error('Pagination overlap detected!');

        log('Testing Page 3 (Limit 10)...');
        const data3 = await makeRequest(`${basePath}?page=3&limit=10`);

        log(`Page 3 Sales Count: ${data3.Sales.length}`);
        if (data3.Sales.length !== 5) throw new Error('Page 3 should have 5 sales');

        log('Pagination Verified Successfully!');

    } catch (error) {
        log('Verification Failed: ' + error.message);
    }
}

verifyPagination();
