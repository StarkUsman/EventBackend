const express = require("express");
const db = require("../models/database");
const router = express.Router();

// Get all additional services
router.get("/", (req, res) => {
  db.all("SELECT * FROM additionalServices", [], (err, rows) => {
    if (err) {
      console.error("Error fetching additional services:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      console.log("Fetched additional services successfully.");
      res.json(rows);
    }
  });
});

// Get a specific additional service
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM additionalServices WHERE additional_service_id = ?", [id], (err, row) => {
    if (err) {
      console.error(`Error fetching additional service with ID ${id}:`, err.message);
      res.status(500).json({ error: err.message });
    } else if (row) {
      console.log(`Fetched additional service with ID ${id} successfully.`);
      res.json(row);
    } else {
      res.status(404).json({ message: "Additional service not found" });
    }
  });
});

// Create a new additional service
router.post("/", (req, res) => {
  const { additional_service_name, additional_service_name_urdu, description, price, category, isEditable } = req.body;
  if (!additional_service_name || !price || !category) {
    return res.status(400).json({ error: "Service name, price, and category are required." });
  }

  db.run(
    `INSERT INTO additionalServices (additional_service_name, additional_service_name_urdu, description, price, category, isEditable) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [additional_service_name, additional_service_name_urdu, description, price, category, isEditable ?? 1],
    function (err) {
      if (err) {
        console.error("Error creating additional service:", err.message);
        res.status(500).json({ error: err.message });
      } else {
        console.log(`Additional service created successfully with ID ${this.lastID}.`);
        res.status(201).json({ id: this.lastID });
      }
    }
  );
});

// Update an additional service
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { additional_service_name, additional_service_name_urdu, description, price, category, isEditable } = req.body;
  if (!additional_service_name || !price || !category) {
    return res.status(400).json({ error: "Service name, price, and category are required." });
  }

  db.run(
    `UPDATE additionalServices SET additional_service_name = ?, additional_service_name_urdu = ?, description = ?, 
    price = ?, category = ?, isEditable = ? WHERE additional_service_id = ?`,
    [additional_service_name, additional_service_name_urdu, description, price, category, isEditable, id],
    function (err) {
      if (err) {
        console.error(`Error updating additional service with ID ${id}:`, err.message);
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ message: "Additional service not found" });
      } else {
        console.log(`Additional service with ID ${id} updated successfully.`);
        res.json({ message: "Additional service updated successfully." });
      }
    }
  );
});

// Delete an additional service
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM additionalServices WHERE additional_service_id = ?", [id], function (err) {
    if (err) {
      console.error(`Error deleting additional service with ID ${id}:`, err.message);
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ message: "Additional service not found" });
    } else {
      console.log(`Additional service with ID ${id} deleted successfully.`);
      res.json({ message: "Additional service deleted successfully." });
    }
  });
});

module.exports = router;
