const express = require("express");
const router = express.Router();
const db = require("../models/database");

// CREATE a new profit/loss record
router.post("/", (req, res) => {
  const { totalIncome, totalExpense, profitLoss, monthName, date = new Date().toISOString() } = req.body;

  if (totalIncome == null || totalExpense == null || profitLoss == null || !monthName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  db.run(
    `INSERT INTO profitLoss (totalIncome, totalExpense, profitLoss, monthName, date)
     VALUES (?, ?, ?, ?, ?)`,
    [totalIncome, totalExpense, profitLoss, monthName, date],
    function (err) {
      if (err) {
        console.error("Error inserting profitLoss:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: "Profit/Loss record created", id: this.lastID });
    }
  );
});

// GET all profit/loss records
router.get("/", (req, res) => {
  db.all("SELECT * FROM profitLoss ORDER BY date DESC", [], (err, rows) => {
    if (err) {
      console.error("Error fetching profitLoss records:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: rows, totalData: rows.length });
  });
});

// GET single profit/loss record by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;

  db.get("SELECT * FROM profitLoss WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error("Error fetching profitLoss record:", err.message);
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: "Record not found" });
    }
    res.json({ data: row });
  });
});

// UPDATE a profit/loss record by ID
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { totalIncome, totalExpense, profitLoss, monthName, date } = req.body;

  db.run(
    `UPDATE profitLoss 
     SET totalIncome = ?, totalExpense = ?, profitLoss = ?, monthName = ?, date = ? 
     WHERE id = ?`,
    [totalIncome, totalExpense, profitLoss, monthName, date, id],
    function (err) {
      if (err) {
        console.error("Error updating profitLoss record:", err.message);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: "Record not found" });
      }
      res.json({ message: "Profit/Loss record updated successfully" });
    }
  );
});

router.put("/update/:monthName", (req, res) => {
  const { monthName } = req.params;
  const { totalIncome, totalExpense, profitLoss, date = new Date().toISOString() } = req.body;

  //check if object with given monthName exists if not create it
    db.get("SELECT * FROM profitLoss WHERE monthName = ?", [monthName], (err, row) => {
        if (err) {
        console.error("Error fetching profitLoss record:", err.message);
        return res.status(500).json({ error: err.message });
        }
        if (!row) {
        // Create a new record if it doesn't exist
        db.run(
            `INSERT INTO profitLoss (totalIncome, totalExpense, profitLoss, monthName, date)
             VALUES (?, ?, ?, ?, ?)`,
            [totalIncome, totalExpense, profitLoss, monthName, date],
            function (err) {
            if (err) {
                console.error("Error inserting profitLoss:", err.message);
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: "Profit/Loss record created", id: this.lastID });
            }
        );
        } else {
        // Update the existing record
        db.run(
            `UPDATE profitLoss 
             SET totalIncome = ?, totalExpense = ?, profitLoss = ?, date = ? 
             WHERE monthName = ?`,
            [totalIncome, totalExpense, profitLoss, date, monthName],
            function (err) {
            if (err) {
                console.error("Error updating profitLoss record:", err.message);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Profit/Loss record updated successfully" });
            }
        );
        }
    });

});

// DELETE a profit/loss record
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM profitLoss WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Error deleting profitLoss record:", err.message);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Record not found" });
    }
    res.json({ message: "Profit/Loss record deleted successfully" });
  });
});

module.exports = router;
