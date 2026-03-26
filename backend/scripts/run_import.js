// const fetch = require('node-fetch'); // Native fetch used in Node 18+

const data = {
    products: [
        // 1. AIS Glass
        {
            category: "Glass",
            brand: "AIS",
            model_application: "JCB 3DX",
            position: "Front",
            part_number: "JCB-3DX-WIND-LAM",
            description: "Laminated Windshield",
            price: 5150,
            specification: "Laminated"
        },
        {
            category: "Glass",
            brand: "AIS",
            model_application: "Tata 1613",
            position: "Rear",
            part_number: "TATA-1613-WIND-LAM",
            description: "Laminated Windshield",
            price: 4650,
            specification: "Laminated"
        },
        // 2. Suspension Parts
        {
            category: "Suspension",
            brand: "TATA",
            model_application: "1613",
            position: "Front",
            part_number: "BPT 1026",
            oe_part_number: "352 320 0063",
            description: "Front Spring Shackle W/B",
            price: 458, // Estimated
            specification: "60x6" // Assumed dim from context
        },
        {
            category: "Suspension",
            brand: "Leyland",
            model_application: "Taurus",
            position: "Rear",
            part_number: "BPL 2005",
            oe_part_number: "F-3210122",
            description: "Rear Spring Shackle W/B",
            price: 495,
            specification: "90x24"
        },
        // 3. General / Maruthi Parts
        {
            category: "General",
            brand: "Maruthi",
            model_application: "Omni", // Assumed
            part_number: "MC 151 A",
            description: "Brake Shoe", // Assumed based on code
            price: 71.00
        },
        {
            category: "General",
            brand: "Maruthi",
            model_application: "800",
            part_number: "MC 152",
            description: "Clutch Cable",
            price: 75.00
        }
    ]
};

async function runImport() {
    try {
        console.log('Sending data to import API...');
        const response = await fetch('http://localhost:5001/api/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log('Response:', result);
    } catch (error) {
        console.error('Error:', error);
    }
}

runImport();
