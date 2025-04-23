const db = require("./database");

db.run(`ALTER TABLE transactions ADD COLUMN img TEXT`, (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.error("Failed to add 'img' column:", err.message);
    } else {
      console.log("'img' column added or already exists.");
    }
  });


  //      item_name TEXT NOT NULL UNIQUE,
