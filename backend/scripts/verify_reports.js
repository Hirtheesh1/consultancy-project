const http = require('http');

const endpoints = [
    '/api/financial-reports/sales-summary',
    '/api/financial-reports/purchase-summary',
    '/api/financial-reports/gst-summary',
    '/api/financial-reports/profit-and-loss',
    '/api/financial-reports/inventory-valuation',
    '/api/financial-reports/fy-summary'
];

async function testEndpoint(path) {
    return new Promise((resolve) => {
        http.get('http://localhost:5005' + path, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`[PASS] ${path}`);
                    resolve(true);
                } else {
                    console.log(`[FAIL] ${path} - Status: ${res.statusCode}`);
                    console.log(`Response: ${data}`);
                    resolve(false);
                }
            });
        }).on('error', (err) => {
            console.log(`[ERROR] ${path} - ${err.message}`);
            resolve(false);
        });
    });
}

(async () => {
    for (const ep of endpoints) {
        await testEndpoint(ep);
    }
})();
