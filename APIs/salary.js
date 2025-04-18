const express = require("express");
const router = express.Router();
const db = require("../models/database");

// CREATE salary
router.post("/", (req, res) => {
  const { vendor, menuItems = [], amount = 0, variableAmount = 0 } = req.body;

  db.run(
    `INSERT INTO salaries (vendor, menuItems, amount, variableAmount) VALUES (?, ?, ?, ?)`,
    [JSON.stringify(vendor), JSON.stringify(menuItems), amount, variableAmount],
    function (err) {
      if (err) {
        console.error("Error creating salary record:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// GET all salaries
router.get("/", (req, res) => {
  db.all("SELECT * FROM salaries", [], (err, rows) => {
    if (err) {
      console.error("Error fetching salaries:", err.message);
      return res.status(500).json({ error: err.message });
    }

    const formatted = rows.map((row, i) => ({
      ...row,
      sNo: i + 1,
      vendor: JSON.parse(row.vendor),
      menuItems: row.menuItems ? JSON.parse(row.menuItems) : []
    }));

    res.json({ data: formatted, totalData: formatted.length });
  });
});

// GET salary by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;

  db.get("SELECT * FROM salaries WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error("Error fetching salary:", err.message);
      return res.status(500).json({ error: err.message });
    }
    if (!row) return res.status(404).json({ message: "Salary not found" });

    res.json({
      ...row,
      vendor: JSON.parse(row.vendor),
      menuItems: row.menuItems ? JSON.parse(row.menuItems) : []
    });
  });
});

// UPDATE salary
router.put("/:id", (req, res) => {
  const { id } = req.params;
  console.log("Updating salary with ID:", id);
  console.log("Request body:", req.body);
  const { vendor, menuItems = [], amount = 0, variableAmount = 0 } = req.body;

  db.run(
    `UPDATE salaries SET vendor = ?, menuItems = ?, amount = ?, variableAmount = ? WHERE id = ?`,
    [JSON.stringify(vendor), JSON.stringify(menuItems), amount, variableAmount, id],
    function (err) {
      if (err) {
        console.error("Error updating salary:", err.message);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0)
        return res.status(404).json({ message: "Salary not found" });

      res.json({ message: "Salary updated successfully" });
    }
  );
});

// DELETE salary
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM salaries WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Error deleting salary:", err.message);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0)
      return res.status(404).json({ message: "Salary not found" });

    res.json({ message: "Salary deleted successfully" });
  });
});

module.exports = router;
