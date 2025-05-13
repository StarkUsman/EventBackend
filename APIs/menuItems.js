const express = require("express");
const db = require("../models/database");
const router = express.Router();

// Get all menu items (RAW)
router.get("/", (req, res) => {
  db.all("SELECT * FROM menuItems", [], (err, rows) => {
    if (err) {
      console.error("[GET /menu-items] Error fetching menu items:", err.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    console.log("[GET /menu-items] Fetched menu items successfully.");
    res.json(rows);
  });
});

// Get all menu items (FORMATTED)
router.get("/formatted", (req, res) => {
  db.all(
    `SELECT 
      menu_item_id, 
      item_name, 
      item_name_urdu, 
      description, 
      price, 
      category, 
      createdAt, 
      updatedAt 
    FROM menuItems ORDER BY menu_item_id ASC`, 
    [], 
    (err, rows) => {
      if (err) {
        console.error("[GET /menu-items/formatted] Error fetching menu items:", err.message);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      const formattedRows = rows.map((row, index) => ({
        sNo: index + 1, // Serial number
        menu_item_id: row.menu_item_id,
        item_name: row.item_name,
        item_name_urdu: row.item_name_urdu,
        description: row.description,
        price: row.price,
        category: row.category,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      }));

      res.json({
        data: formattedRows,   
        totalData: rows.length 
      });
    }
  );
});

// Get a specific menu item
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM menuItems WHERE menu_item_id = ?", [id], (err, row) => {
    if (err) {
      console.error(`Error fetching menu item with ID ${id}:`, err.message);
      res.status(500).json({ error: err.message });
    } else if (row) {
      console.log(`Fetched menu item with ID ${id} successfully.`);
      res.json(row);
    } else {
      res.status(404).json({ message: "Menu item not found" });
    }
  });
});

// Create a new menu item
router.post("/", (req, res) => {
  const { item_name, item_name_urdu, description, price, category } = req.body;
  if (!item_name) {
    return res.status(400).json({ error: "Item name is required." });
  }

  db.run(
    `INSERT INTO menuItems (item_name, item_name_urdu, description, price, category) 
     VALUES (?, ?, ?, ?, ?)`,
    [item_name, item_name_urdu, description, price, category],
    function (err) {
      if (err) {
        console.error("Error creating menu item:", err.message);
        res.status(500).json({ error: err.message });
      } else {
        console.log(`Menu item created successfully with ID ${this.lastID}.`);
        res.status(201).json({ id: this.lastID });
      }
    }
  );
});

// Update a menu item
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { item_name, item_name_urdu, description, price, category } = req.body;
  if (!item_name) {
    return res.status(400).json({ error: "Item name is required." });
  }

  db.run(
    `UPDATE menuItems SET item_name = ?, item_name_urdu = ?, description = ?, 
    price = ?, category = ? WHERE menu_item_id = ?`,
    [item_name, item_name_urdu, description, price, category, id],
    function (err) {
      if (err) {
        console.error(`Error updating menu item with ID ${id}:`, err.message);
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ message: "Menu item not found" });
      } else {
        console.log(`Menu item with ID ${id} updated successfully.`);
        res.json({ message: "Menu item updated successfully." });
      }
    }
  );
});

// Delete a menu item
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM menuItems WHERE menu_item_id = ?", [id], function (err) {
    if (err) {
      console.error(`Error deleting menu item with ID ${id}:`, err.message);
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ message: "Menu item not found" });
    } else {
      console.log(`Menu item with ID ${id} deleted successfully.`);
      res.json({ message: "Menu item deleted successfully." });
    }
  });
});

module.exports = router;
