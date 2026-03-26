const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'database/inventory.sqlite');

console.log('Using DB path:', dbPath);

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('Creating table...');
    db.run("CREATE TABLE lorem (info TEXT)");

    console.log('Inserting row...');
    const stmt = db.prepare("INSERT INTO lorem VALUES (?)");
    stmt.run("Ipsum");
    stmt.finalize();

    console.log('Selecting row...');
    db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
        if (err) console.error(err);
        else console.log(row.id + ": " + row.info);
    });
});

db.close(() => {
    console.log('Database closed.');
});
