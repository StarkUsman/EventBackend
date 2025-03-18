const express = require("express");
const db = require("../models/database");
const router = express.Router();

// Get all bookings
router.get("/", (req, res) => {
  db.all("SELECT * FROM bookings ORDER BY booking_id DESC", [], (err, rows) => {
    if (err) {
      console.error("Error fetching bookings:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      console.log("Fetched bookings successfully.");
      const formattedResponse = rows.map((row) => ({
        ...row,
        SLOT: JSON.parse(row.SLOT)
      }));
      res.json(formattedResponse);
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
    contact_number,
    alt_contact_number,
    booking_type,
    event_type,
    description,
    slot_day,
    slot_type,
    slot_number,
    number_of_persons,
    menu_id,
    menu_items_ids,
    add_service_ids,
    discount = 0,
    advance = 0,
    total_remaining = 0,
    notes,
    isDrafted = 0,
    status = null,
    SLOT
  } = req.body;

  // Ensure required fields are provided
  // if (!booking_type || !event_type || !slot_day || !slot_type || slot_number === undefined || !number_of_persons || !menu_id) {
  //   return res.status(400).json({ error: "All required fields (booking_type, event_type, slot_day, slot_type, slot_number, number_of_persons, menu_id, total_amount) must be provided." });
  // }

  const total_amount = req.body.total_remaining + req.body.advance;

  db.run(
    `INSERT INTO bookings 
      (booking_name, contact_number, alt_contact_number, booking_type, event_type, description, date, slot_day, slot_type, slot_number, 
       number_of_persons, menu_id, menu_items_ids, add_service_ids, discount, advance, total_remaining, total_amount, notes, isDrafted, status, SLOT) 
     VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    [
      booking_name || null,
      contact_number || null,
      alt_contact_number || null,
      booking_type,
      event_type,
      description || null,
      slot_day,
      slot_type,
      slot_number,
      number_of_persons,
      menu_id,
      menu_items_ids || null,
      add_service_ids || null,
      discount,
      advance,
      total_remaining,
      total_amount,
      notes || null,
      isDrafted || 0,
      status || null,
      JSON.stringify(SLOT)
    ],

    function (err) {
      if (err) {
        console.error("Error creating booking:", err);
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