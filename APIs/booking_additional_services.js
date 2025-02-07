const express = require("express");
const db = require("../models/database");
const router = express.Router();

// Get all booking additional services
router.get("/", (req, res) => {
  db.all("SELECT * FROM booking_additional_services", [], (err, rows) => {
    if (err) {
      console.error("Error fetching booking additional services:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      console.log("Fetched booking additional services successfully.");
      res.json(rows);
    }
  });
});

// Create a new booking additional service
router.post("/", (req, res) => {
  const { booking_id, additional_service_id, quantity, total_additional_service_price } = req.body;
  if (!booking_id || !additional_service_id || !quantity || !total_additional_service_price) {
    return res.status(400).json({ error: "Booking ID, additional service ID, quantity, and total price are required." });
  }

  db.run(
    `INSERT INTO booking_additional_services (booking_id, additional_service_id, quantity, total_additional_service_price) 
     VALUES (?, ?, ?, ?)`,
    [booking_id, additional_service_id, quantity, total_additional_service_price],
    function (err) {
      if (err) {
        console.error("Error creating booking additional service:", err.message);
        res.status(500).json({ error: err.message });
      } else {
        console.log(`Booking additional service created successfully with ID ${this.lastID}.`);
        res.status(201).json({ id: this.lastID });
      }
    }
  );
});

// Delete a booking additional service
router.delete("/", (req, res) => {
  const { booking_id, additional_service_id } = req.body;
  if (!booking_id || !additional_service_id) {
    return res.status(400).json({ error: "Booking ID and additional service ID are required." });
  }

  db.run(
    "DELETE FROM booking_additional_services WHERE booking_id = ? AND additional_service_id = ?",
    [booking_id, additional_service_id],
    function (err) {
      if (err) {
        console.error("Error deleting booking additional service:", err.message);
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ message: "Booking additional service not found" });
      } else {
        console.log("Booking additional service deleted successfully.");
        res.json({ message: "Booking additional service deleted successfully." });
      }
    }
  );
});

module.exports = router;
