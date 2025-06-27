const db = require("./database");

db.exec(`
  DROP TABLE IF EXISTS bookings;
  DROP TABLE IF EXISTS bookingLedger;
  DROP TABLE IF EXISTS salaries;
  DROP TABLE IF EXISTS transactions;
  DROP TABLE IF EXISTS ledger;
`, (err) => {
  if (err) {
    console.error("Error dropping tables:", err.message);
  } else {
    console.log("Tables dropped successfully");
  }
});

db.run(`ALTER TABLE bookingLedger ADD COLUMN trans_id INTEGER;`, (err) => {
  if (err) {
    console.error("Error adding column:", err.message);
  } else {
    console.log("Column added successfully");
  }
});

// const updatedLedger = {
//   id: 86,
//   name: "OB",
//   purch_id: 0,
//   vendor_id: 48,
//   amountDebit: 533295,
//   amountCredit: 0,
//   balance: -533295,
//   reference: null,
//   createdAt: "2025-02-28 12:14:11"
// };

// const updateQuery = `
//   UPDATE ledger SET
//     name = ?,
//     purch_id = ?,
//     vendor_id = ?,
//     amountDebit = ?,
//     amountCredit = ?,
//     balance = ?,
//     reference = ?,
//     createdAt = ?
//   WHERE id = ?;
// `;

// db.run(updateQuery, [
//   updatedLedger.name,
//   updatedLedger.purch_id,
//   updatedLedger.vendor_id,
//   updatedLedger.amountDebit,
//   updatedLedger.amountCredit,
//   updatedLedger.balance,
//   updatedLedger.reference,
//   updatedLedger.createdAt,
//   updatedLedger.id
// ], function(err) {
//   if (err) {
//     return console.error('Update failed:', err.message);
//   }
//   console.log(`Row(s) updated: ${this.changes}`);
// });

// // Close the DB connection when done
// db.close();
