const express = require("express");
const router = express.Router();
const db = require("../models/database");

// 🚀 Get all units
router.get("/", (req, res) => {
  db.all("SELECT * FROM units ORDER BY unit_id desc", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Format response similar to vendors API
    const formattedData = rows.map((unit, index) => ({
      sNo: index + 1,
      unit_id: unit.unit_id,
      unit_name: unit.unit_name,
      symbol: unit.symbol,
    }));

    res.json({ data: formattedData, totalData: formattedData.length });
  });
});

// 🚀 Get unit by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM units WHERE unit_id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: "Unit not found" });
    }
    res.json(row);
  });
});

// 🚀 Create a new unit
router.post("/", (req, res) => {
  const { unit_name, symbol } = req.body;

  if (!unit_name || !symbol) {
    return res.status(400).json({ error: "All fields are required" });
  }

  db.run(
    `INSERT INTO units (unit_name, symbol) VALUES (?, ?)`,
    [unit_name, symbol],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ unit_id: this.lastID, unit_name, symbol });
    }
  );
});

// 🚀 Update a unit
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { unit_name, symbol } = req.body;

  if (!unit_name  || !symbol) {
    return res.status(400).json({ error: "All fields are required" });
  }

  db.run(
    `UPDATE units SET unit_name = ?, symbol = ? WHERE unit_id = ?`,
    [unit_name, symbol, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Unit not found" });
      }
      res.json({ message: "Unit updated successfully" });
    }
  );
});

// 🚀 Delete a unit
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM units WHERE unit_id = ?`, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Unit not found" });
    }
    res.json({ message: "Unit deleted successfully" });
  });
});

module.exports = router;
