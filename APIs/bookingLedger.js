const express = require("express");
const router = express.Router();
const db = require("../models/database");

// CREATE booking ledger entry
router.post("/", (req, res) => {
  const { booking_id, user = null, amount = 0, account = null, date = null, ledgerId } = req.body;

  db.run(
    `INSERT INTO bookingLedger (booking_id, user, amount, account, date, ledgerId) VALUES (?, ?, ?, ?, ?, ?)`,
    [booking_id, user, amount, account, date || new Date().toISOString(), ledgerId],
    function (err) {
      if (err) {
        console.error("Error creating booking ledger entry:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// GET all booking ledger entries
router.get("/", (req, res) => {
  db.all("SELECT * FROM bookingLedger ORDER BY date DESC", [], (err, rows) => {
    if (err) {
      console.error("Error fetching booking ledger entries:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: rows, totalData: rows.length });
  });
});

// GET booking ledger entry by booking_id
router.get("/:booking_id", (req, res) => {
  const { booking_id } = req.params;

  db.all("SELECT * FROM bookingLedger WHERE booking_id = ? ORDER BY date DESC", [booking_id], (err, rows) => {
    if (err) {
      console.error("Error fetching booking ledger entries:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: rows, totalData: rows.length });
  });
});

// UPDATE a booking ledger entry
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { booking_id, user = null, amount = 0, account = null, date = null } = req.body;

  db.run(
    `UPDATE bookingLedger SET booking_id = ?, user = ?, amount = ?, account = ?, date = ? WHERE id = ?`,
    [booking_id, user, amount, account, date || new Date().toISOString(), id],
    function (err) {
      if (err) {
        console.error("Error updating booking ledger entry:", err.message);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: "Ledger entry not found" });
      }
      res.json({ message: "Booking ledger entry updated successfully" });
    }
  );
});

// DELETE a booking ledger entry
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM bookingLedger WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Error deleting booking ledger entry:", err.message);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Ledger entry not found" });
    }
    res.json({ message: "Booking ledger entry deleted successfully" });
  });
});

module.exports = router;
