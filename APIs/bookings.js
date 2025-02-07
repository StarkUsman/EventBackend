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
  const { event_id, hall_id, slot_id, booking_date, menu_id, menu_item_ids, no_of_persons, 
          final_menu_price, final_base_menu_price, total_additional_service_price, 
          total_amount, discount, total_payable_amount } = req.body;
  
  if (!event_id || !hall_id || !slot_id || !booking_date || !menu_id || !menu_item_ids) {
    return res.status(400).json({ error: "All required fields (event_id, hall_id, slot_id, etc.) must be provided." });
  }

  db.run(
    `INSERT INTO bookings (event_id, hall_id, slot_id, booking_date, menu_id, menu_item_ids, no_of_persons, 
      final_menu_price, final_base_menu_price, total_additional_service_price, total_amount, 
      discount, total_payable_amount) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [event_id, hall_id, slot_id, booking_date, menu_id, menu_item_ids, no_of_persons,
     final_menu_price, final_base_menu_price, total_additional_service_price, total_amount, 
     discount, total_payable_amount],
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
