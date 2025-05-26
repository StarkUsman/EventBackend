const db = require("./database");

db.run(`DROP TABLE IF EXISTS bookings`, (err) => {
  if (err) {
    console.error("Error adding column:", err.message);
  } else {
    console.log("Column added successfully");
  }
});

// db.run(`ALTER TABLE bookingLedger ADD COLUMN trans_id INTEGER;`, (err) => {
//   if (err) {
//     console.error("Error adding column:", err.message);
//   } else {
//     console.log("Column added successfully");
//   }
// });