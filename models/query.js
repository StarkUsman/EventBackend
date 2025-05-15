const db = require("./database");

db.run(`DROP TABLE IF EXISTS salaries`, (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.error("Failed to drop ledger table", err.message);
    } else {
      console.log("Table 'ledger' dropped successfully or did not exist.");
    }
  });


  //      item_name TEXT NOT NULL UNIQUE,
