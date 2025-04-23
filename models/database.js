const sqlite3 = require("sqlite3").verbose();

// const dbPath = process.env.DB_PATH || "C:\\database\\database.sqlite";
const dbPath = process.env.DB_PATH || "./database.sqlite";

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database at", dbPath);
  }
});

module.exports = db;
