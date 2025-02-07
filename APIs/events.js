const express = require("express");
const db = require("../models/database");
const router = express.Router();

// Get all events
router.get("/", (req, res) => {
  db.all(
    `SELECT events.*, halls.hall_name FROM events
     JOIN halls ON events.hall_id = halls.hall_id`,
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(rows);
      }
    }
  );
});

// Get a specific event
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM events WHERE event_id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (row) {
      res.json(row);
    } else {
      res.status(404).json({ message: "Event not found" });
    }
  });
});

// Create a new event
router.post("/", (req, res) => {
  const { event_name, description, hall_id } = req.body;
  if (!event_name || !hall_id) {
    return res.status(400).json({ error: "Event name and hall ID are required." });
  }

  db.run(
    "INSERT INTO events (event_name, description, hall_id) VALUES (?, ?, ?)",
    [event_name, description, hall_id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json({ id: this.lastID });
      }
    }
  );
});

// Update an event
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { event_name, description, hall_id } = req.body;
  if (!event_name || !hall_id) {
    return res.status(400).json({ error: "Event name and hall ID are required." });
  }

  db.run(
    "UPDATE events SET event_name = ?, description = ?, hall_id = ? WHERE event_id = ?",
    [event_name, description, hall_id, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ message: "Event not found" });
      } else {
        res.json({ message: "Event updated successfully." });
      }
    }
  );
});

// Delete an event
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM events WHERE event_id = ?", [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ message: "Event not found" });
    } else {
      res.json({ message: "Event deleted successfully." });
    }
  });
});

module.exports = router;
