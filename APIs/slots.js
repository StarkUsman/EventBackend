const express = require("express");
const db = require("../models/database");
const router = express.Router();

// Get all slots
router.get("/", (req, res) => {
  db.all("SELECT * FROM slots", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Get a specific slot
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM slots WHERE slot_id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (row) {
      res.json(row);
    } else {
      res.status(404).json({ message: "Slot not found" });
    }
  });
});

// Create a new slot
router.post("/", (req, res) => {
  const { hall_id, start_time, end_time, isAvailable } = req.body;
  if (!hall_id || !start_time || !end_time) {
    return res.status(400).json({ error: "Hall ID, start time, and end time are required." });
  }

  db.run(
    "INSERT INTO slots (hall_id, start_time, end_time, isAvailable) VALUES (?, ?, ?, ?)",
    [hall_id, start_time, end_time, isAvailable ?? 1],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json({ id: this.lastID });
      }
    }
  );
});

// Update a slot
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { hall_id, start_time, end_time, isAvailable } = req.body;
  if (!hall_id || !start_time || !end_time) {
    return res.status(400).json({ error: "Hall ID, start time, and end time are required." });
  }

  db.run(
    "UPDATE slots SET hall_id = ?, start_time = ?, end_time = ?, isAvailable = ? WHERE slot_id = ?",
    [hall_id, start_time, end_time, isAvailable, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ message: "Slot not found" });
      } else {
        res.json({ message: "Slot updated successfully." });
      }
    }
  );
});

// Delete a slot
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM slots WHERE slot_id = ?", [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ message: "Slot not found" });
    } else {
      res.json({ message: "Slot deleted successfully." });
    }
  });
});

router.post("/isAvailable", (req, res) => {
  try{
    const { slot_day, slot_type, slot_number } = req.body;
    if (!slot_day || !slot_type || slot_number === undefined) {
      return res.status(400).json({ error: "Slot day, type, and number are required." });
    }

    db.get("SELECT * FROM bookings WHERE slot_day = ? AND slot_type = ? AND slot_number = ?", [slot_day, slot_type, slot_number], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (row) {
        res.json({ isAvailable: false });
      } else {
        res.json({ isAvailable: true });
      }n
    }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
