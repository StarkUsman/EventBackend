const db = require("./database");
  //      item_name TEXT NOT NULL UNIQUE,
const keepTables = ['halls', 'events'];

db.all(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`, (err, tables) => {
  if (err) {
    console.error("Error fetching table names:", err.message);
    return;
  }

  const tablesToDrop = tables
    .map(row => row.name)
    .filter(name => !keepTables.includes(name));

  if (tablesToDrop.length === 0) {
    console.log("No tables to drop.");
    return;
  }

  tablesToDrop.forEach(table => {
    db.run(`DROP TABLE IF EXISTS ${table}`, (err) => {
      if (err && !err.message.includes("duplicate column name")) {
        console.error(`Failed to drop table '${table}':`, err.message);
      } else {
        console.log(`Table '${table}' dropped successfully.`);
      }
    });
  });
});
