const db = require("./database");

db.run(`DROP TABLE IF EXISTS bookings`, (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.error("Failed to add 'img' column:", err.message);
    } else {
      console.log("'img' column added or already exists.");
    }
  });


  //      item_name TEXT NOT NULL UNIQUE,
