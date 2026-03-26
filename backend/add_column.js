const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./backend/database/inventory.sqlite');

db.serialize(() => {
    db.run("ALTER TABLE Sales ADD COLUMN customerId INTEGER REFERENCES Customers(id) ON DELETE SET NULL ON UPDATE CASCADE", (err) => {
        if (err) {
            console.error('Error adding column:', err.message);
        } else {
            console.log('Successfully added customerId column to Sales table.');
        }
    });

    db.all("PRAGMA table_info(Sales)", (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Updated Table Schema:', rows);
        }
    });
});

db.close();
