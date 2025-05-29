const express = require("express");
const router = express.Router();
const db = require("../models/database");

// CREATE salary history entry
router.post("/", (req, res) => {
  const { vendor, numberOfPersons = 0, rate = 0, totalAmount = 0, Dated } = req.body;

  const query = `
    INSERT INTO salaryHistory (vendor, numberOfPersons, rate, totalAmount, Dated)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [JSON.stringify(vendor), numberOfPersons, rate, totalAmount, Dated || new Date().toISOString().split('T')[0]],
    function (err) {
      if (err) {
        console.error("Error inserting salary history:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: "Salary history added", id: this.lastID });
    }
  );
});

// READ all salary history entries
router.get("/", (req, res) => {
  db.all("SELECT * FROM salaryHistory ORDER BY Dated DESC", [], (err, rows) => {
    if (err) {
      console.error("Error fetching salary history:", err.message);
      return res.status(500).json({ error: err.message });
    }

    // Parse JSON vendor
    const data = rows.map(entry => ({
      ...entry,
      vendor: JSON.parse(entry.vendor)
    }));

    res.json({ data, totalData: data.length });
  });
});

// READ one salary history entry by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;

  db.get("SELECT * FROM salaryHistory WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error("Error fetching salary history:", err.message);
      return res.status(500).json({ error: err.message });
    }

    if (!row) return res.status(404).json({ message: "Salary history not found" });

    row.vendor = JSON.parse(row.vendor);
    res.json(row);
  });
});

// UPDATE salary history entry
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { vendor, numberOfPersons, rate, totalAmount, Dated } = req.body;

  const query = `
    UPDATE salaryHistory
    SET vendor = ?, numberOfPersons = ?, rate = ?, totalAmount = ?, Dated = ?
    WHERE id = ?
  `;

  db.run(
    query,
    [JSON.stringify(vendor), numberOfPersons, rate, totalAmount, Dated || new Date().toISOString().split('T')[0], id],
    function (err) {
      if (err) {
        console.error("Error updating salary history:", err.message);
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: "Salary history not found" });
      }

      res.json({ message: "Salary history updated successfully" });
    }
  );
});

// DELETE salary history entry
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM salaryHistory WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Error deleting salary history:", err.message);
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "Salary history not found" });
    }

    res.json({ message: "Salary history deleted successfully" });
  });
});

module.exports = router;
