const express = require("express");
const db = require("../models/database");
const router = express.Router();

// Get all halls
router.get("/", (req, res) => {
  db.all("SELECT * FROM halls", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Get a specific hall
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM halls WHERE hall_id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (row) {
      res.json(row);
    } else {
      res.status(404).json({ message: "Hall not found" });
    }
  });
});

// Create a new hall
router.post("/", (req, res) => {
  const { hall_name, capacity, isAvailable } = req.body;
  if (!hall_name || !capacity) {
    return res.status(400).json({ error: "Hall name and capacity are required." });
  }

  db.run(
    "INSERT INTO halls (hall_name, capacity, isAvailable) VALUES (?, ?, ?)",
    [hall_name, capacity, isAvailable ?? 1],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json({ id: this.lastID });
      }
    }
  );
});

// Update a hall
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { hall_name, capacity, isAvailable } = req.body;
  db.run(
    "UPDATE halls SET hall_name = ?, capacity = ?, isAvailable = ? WHERE hall_id = ?",
    [hall_name, capacity, isAvailable, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ message: "Hall not found" });
      } else {
        res.json({ message: "Hall updated successfully." });
      }
    }
  );
});

// Delete a hall
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM halls WHERE hall_id = ?", [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ message: "Hall not found" });
    } else {
      res.json({ message: "Hall deleted successfully." });
    }
  });
});

module.exports = router;
