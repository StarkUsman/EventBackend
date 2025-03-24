const express = require("express");
const db = require("../models/database");
const router = express.Router();

/**
 * 🔹 Get All Inventory Items (with Unit Name, ID, and Serial Number)
 */
router.get("/", (req, res) => {
  const query = `
    SELECT 
      p.id, p.item, p.code, 
      u.unit_name AS units, 
      p.quantity, 
      p.purchasePrice AS purchase
    FROM product p
    LEFT JOIN units u ON p.unit = u.unit_id
    ORDER BY p.id DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const response = {
      data: rows.map((row, index) => ({
        sNo: index + 1, // Serial number based on index
        id: row.id,
        item: row.item,
        code: row.code,
        units: row.units || "Unknown",
        quantity: row.quantity.toString(),
        purchase: row.purchase.toFixed(2),
      })),
      totalData: rows.length,
    };

    res.json(response);
  });
});

/**
 * 🔹 Get Inventory Item by ID (Returns Unit ID, Not Unit Name)
 */
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT 
      id, item, code, 
      unit, 
      quantity, 
      purchasePrice AS purchase
    FROM product
    WHERE id = ?
  `;

  db.get(query, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    const formattedItem = {
      id: row.id,
      item: row.item,
      code: row.code,
      units: row.unit, // Returns unit_id instead of unit_name
      quantity: row.quantity.toString(),
      purchase: row.purchase.toFixed(2),
    };

    res.json(formattedItem);
  });
});

/**
 * 🔹 Add New Inventory Item (Parses Prices to Number)
 */
router.post("/", (req, res) => {
  const { item, code, quantity, purchase } = req.body;

  if (!item || !code || !quantity || !purchase) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const parsedPurchase = parseFloat(purchase.toString().replace(/[^0-9.]/g, "")) || 0;

  const query = `
    INSERT INTO product (item, code, quantity, purchasePrice) 
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(query, [item, code, quantity, parsedPurchase], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({ message: "Inventory item added successfully", id: this.lastID });
  });
});

/**
 * 🔹 Update Inventory Item (Parses Prices to Number)
 */
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { item, code, quantity, purchase } = req.body;

  if (!item || !code || !quantity || !purchase) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const parsedPurchase = parseFloat(purchase.toString().replace(/[^0-9.]/g, "")) || 0;

  const query = `
    UPDATE product 
    SET item = ?, code = ?, quantity = ?, purchasePrice = ?
    WHERE id = ?
  `;

  db.run(query, [item, code, quantity, parsedPurchase, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    res.json({ message: "Inventory item updated successfully" });
  });
});

/**
 * 🔹 Delete Inventory Item
 */
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM product WHERE id = ?";

  db.run(query, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    res.json({ message: "Inventory item deleted successfully" });
  });
});

module.exports = router;