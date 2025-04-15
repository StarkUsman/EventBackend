// routes/menus.js

const express = require("express");
const db = require("../models/database");
const router = express.Router();

// Logger function
const logError = (message, err) => {
  console.error(message, err);
};

const logSuccess = (message) => {
  console.log(message);
};

// Helper function to convert array to comma-separated string
const arrayToString = (array) => {
  return array && Array.isArray(array) ? array.join(",") : "";
};

// Helper function to convert comma-separated string to array
const stringToArray = (string) => {
  return string ? string.split(",") : [];
};

// Get all menus
router.get("/", async (req, res) => {
  try {
    db.all("SELECT * FROM menus ORDER BY menu_id DESC", (err, rows) => {
      if (err) {
        logError("Error fetching menus:", err.message);
        return res.status(500).json({ error: err.message });
      }

      const formattedData = rows.map((menu, index) => ({
        sNo: index + 1,
        menu_id: menu.menu_id,
        menu_name: menu.menu_name,
        menu_name_urdu: menu.menu_name_urdu,
        menu_item_ids: stringToArray(menu.menu_item_ids),
        description: menu.description,
        isActive: menu.isActive === 1,
        menu_price: menu.menu_price
      }));

      logSuccess("Fetched menus successfully.");
      res.json({ data: formattedData, totalData: formattedData.length });
    });
  } catch (err) {
    logError("Unexpected error fetching menus:", err);
    res.status(500).json({ error: "Unexpected error occurred." });
  }
});

// Get a specific menu
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    db.get("SELECT * FROM menus WHERE menu_id = ?", [id], (err, row) => {
      if (err) {
        logError(`Error fetching menu with ID ${id}:`, err.message);
        res.status(500).json({ error: err.message });
      } else if (row) {
        // Convert menu_item_ids string back to array before sending response
        row.menu_item_ids = stringToArray(row.menu_item_ids);
        logSuccess(`Fetched menu with ID ${id} successfully.`);
        res.json(row);
      } else {
        res.status(404).json({ message: "Menu not found" });
      }
    });
  } catch (err) {
    logError(`Unexpected error fetching menu with ID ${id}:`, err);
    res.status(500).json({ error: "Unexpected error occurred." });
  }
});

// Create a new menu
router.post("/", async (req, res) => {
  const { menu_item_ids, menu_name, menu_name_urdu, description, menu_price, isActive } = req.body;
  
  // Convert menu_item_ids array to a comma-separated string
  const menuItemIdsString = arrayToString(menu_item_ids);

  if (!menu_name) {
    return res.status(400).json({ error: "Menu name and menu price are required." });
  }

  try {
    db.run(
      `INSERT INTO menus (menu_item_ids, menu_name, menu_name_urdu, description, menu_price, isActive) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [menuItemIdsString, menu_name, menu_name_urdu, description, menu_price, isActive ?? 1],
      function (err) {
        if (err) {
          logError("Error creating menu:", err.message);
          res.status(500).json({ error: err.message });
        } else {
          logSuccess(`Menu created successfully with ID ${this.lastID}.`);
          res.status(201).json({ id: this.lastID });
        }
      }
    );
  } catch (err) {
    logError("Unexpected error creating menu:", err);
    res.status(500).json({ error: "Unexpected error occurred." });
  }
});

// Update a menu
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { menu_item_ids, menu_name, menu_name_urdu, description, menu_price, isActive } = req.body;

  // Convert menu_item_ids array to a comma-separated string
  const menuItemIdsString = arrayToString(menu_item_ids);

  if (!menu_name || !menu_price) {
    return res.status(400).json({ error: "Menu name and menu price are required." });
  }

  try {
    db.run(
      `UPDATE menus SET menu_item_ids = ?, menu_name = ?, menu_name_urdu = ?, description = ?, 
      menu_price = ?, isActive = ?, updatedAt = CURRENT_TIMESTAMP WHERE menu_id = ?`,
      [menuItemIdsString, menu_name, menu_name_urdu, description, menu_price, isActive, id],
      function (err) {
        if (err) {
          logError(`Error updating menu with ID ${id}:`, err.message);
          res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
          res.status(404).json({ message: "Menu not found" });
        } else {
          logSuccess(`Menu with ID ${id} updated successfully.`);
          res.json({ message: "Menu updated successfully." });
        }
      }
    );
  } catch (err) {
    logError(`Unexpected error updating menu with ID ${id}:`, err);
    res.status(500).json({ error: "Unexpected error occurred." });
  }
});

// Delete a menu
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    db.run("DELETE FROM menus WHERE menu_id = ?", [id], function (err) {
      if (err) {
        logError(`Error deleting menu with ID ${id}:`, err.message);
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ message: "Menu not found" });
      } else {
        logSuccess(`Menu with ID ${id} deleted successfully.`);
        res.json({ message: "Menu deleted successfully." });
      }
    });
  } catch (err) {
    logError(`Unexpected error deleting menu with ID ${id}:`, err);
    res.status(500).json({ error: "Unexpected error occurred." });
  }
});

module.exports = router;
