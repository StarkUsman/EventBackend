const express = require("express");
const db = require("../models/database");
const router = express.Router();

// Get all menu-item relationships
router.get("/", (req, res) => {
  db.all("SELECT * FROM menu_x_items", [], (err, rows) => {
    if (err) {
      console.error("Error fetching menu-item relationships:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      console.log("Fetched menu-item relationships successfully.");
      res.json(rows);
    }
  });
});

// Add a new menu-item relationship
router.post("/", (req, res) => {
  const { menu_id, menu_item_id } = req.body;
  if (!menu_id || !menu_item_id) {
    return res.status(400).json({ error: "Menu ID and menu item ID are required." });
  }

  db.run(
    "INSERT INTO menu_x_items (menu_id, menu_item_id) VALUES (?, ?)",
    [menu_id, menu_item_id],
    function (err) {
      if (err) {
        console.error("Error creating menu-item relationship:", err.message);
        res.status(500).json({ error: err.message });
      } else {
        console.log(`Menu-item relationship created successfully.`);
        res.status(201).json({ id: this.lastID });
      }
    }
  );
});

// Delete a menu-item relationship
router.delete("/", (req, res) => {
  const { menu_id, menu_item_id } = req.body;
  if (!menu_id || !menu_item_id) {
    return res.status(400).json({ error: "Menu ID and menu item ID are required." });
  }

  db.run(
    "DELETE FROM menu_x_items WHERE menu_id = ? AND menu_item_id = ?",
    [menu_id, menu_item_id],
    function (err) {
      if (err) {
        console.error("Error deleting menu-item relationship:", err.message);
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ message: "Menu-item relationship not found" });
      } else {
        console.log("Menu-item relationship deleted successfully.");
        res.json({ message: "Menu-item relationship deleted successfully." });
      }
    }
  );
});

module.exports = router;
