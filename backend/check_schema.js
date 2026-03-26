const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./backend/database/inventory.sqlite');

db.all("PRAGMA table_info(Sales)", (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Sales Table Columns:', rows.map(r => r.name));
    }
    db.close();
});
