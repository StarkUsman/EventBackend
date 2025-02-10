const express = require("express");
const db = require("../models/database");
const router = express.Router();

// Get all bookings
router.get("/", (req, res) => {
  db.all("SELECT * FROM bookings", [], (err, rows) => {
    if (err) {
      console.error("Error fetching bookings:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      console.log("Fetched bookings successfully.");
      res.json(rows);
    }
  });
});

// Get a specific booking
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM bookings WHERE booking_id = ?", [id], (err, row) => {
    if (err) {
      console.error(`Error fetching booking with ID ${id}:`, err.message);
      res.status(500).json({ error: err.message });
    } else if (row) {
      console.log(`Fetched booking with ID ${id} successfully.`);
      res.json(row);
    } else {
      res.status(404).json({ message: "Booking not found" });
    }
  });
});

// Create a new booking
router.post("/", (req, res) => {
  const {
    booking_name,
    booker_name,
    description = null,
    slot_day,
    slot_type,
    slot_number,
    number_of_persons,
    add_service_ids = null,
    menu_id
  } = req.body;

  // Ensure required fields are provided
  if (!booker_name || !slot_day || !slot_type || slot_number === undefined || !number_of_persons || !menu_id) {
    return res.status(400).json({ error: "All required fields (booker_name, slot_day, slot_type, etc.) must be provided." });
  }

  db.run(
    `INSERT INTO bookings 
      (booking_name, booker_name, description, date, slot_day, slot_type, slot_number, 
       number_of_persons, add_service_ids, menu_id) 
     VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?)`,
    [
      booking_name,
      booker_name,
      description,
      slot_day,
      slot_type,
      slot_number,
      number_of_persons,
      add_service_ids, // Can be NULL
      menu_id
    ],
    function (err) {
      if (err) {
        console.error("Error creating booking:", err.message);
        res.status(500).json({ error: err.message });
      } else {
        console.log(`Booking created successfully with ID ${this.lastID}.`);
        res.status(201).json({ id: this.lastID });
      }
    }
  );
});

// Delete a booking
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM bookings WHERE booking_id = ?", [id], function (err) {
    if (err) {
      console.error(`Error deleting booking with ID ${id}:`, err.message);
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ message: "Booking not found" });
    } else {
      console.log(`Booking with ID ${id} deleted successfully.`);
      res.json({ message: "Booking deleted successfully." });
    }
  });
});

module.exports = router;