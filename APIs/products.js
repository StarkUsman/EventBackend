const express = require("express");
const router = express.Router();
const db = require("../models/database");

// 🚀 Get all products
router.get("/", (req, res) => {
  const query = `
    SELECT 
      p.id, p.item, p.code, p.quantity, p.alertQuantity,
      p.purchasePrice, p.img, p.description,
      c.category AS category_name,
      u.unit_name AS unit_name
    FROM product p
    LEFT JOIN category c ON p.category = c.id
    LEFT JOIN units u ON p.unit = u.unit_id
    ORDER BY p.id ASC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Format response similar to units API
    const formattedData = rows.map((product, index) => ({
      sNo: index + 1,
      id: product.id,
      item: product.item,
      code: product.code,
      alertQuantity: product.alertQuantity,
      category: product.category_name, // Using category_name from categories table
      unit: product.unit_name, // Using unit_name from units table
      quantity: product.quantity,
      purchasePrice: product.purchasePrice.toFixed(2),
      img: product.img,
      description: product.description
    }));

    res.json({ data: formattedData, totalData: formattedData.length });
  });
});

// 🚀 Get product by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM product WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(row);
  });
});

// 🚀 Create a new product
router.post("/", (req, res) => {
  const { item, code, category, unit, alertQuantity, quantity, purchasePrice, img, description } = req.body;

  if (!item || !purchasePrice) {
    return res.status(400).json({ error: "Required fields are missing" });
  }

  db.run(
    `INSERT INTO product (item, code, category, alertQuantity, unit, quantity, purchasePrice, img, description) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [item, code, category, alertQuantity || null, unit||null, quantity || 0, purchasePrice, img || null, description || null],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, item, code, category, alertQuantity, unit, quantity, purchasePrice, img, description });
    }
  );
});

// 🚀 Update a product
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { item, code, category, alertQuantity, unit, purchasePrice, quantity, img, description } = req.body;

  if (!item || !purchasePrice) {
    return res.status(400).json({ error: "Required fields are missing" });
  }

  db.run(
    `UPDATE product SET item = ?, code = ?, category = ?, alertQuantity = ?, unit = ?, quantity = ?, purchasePrice = ?, img = ?, description = ? WHERE id = ?`,
    [item, code, category, alertQuantity, unit, quantity || 0, purchasePrice, img, description, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ message: "Product updated successfully" });
    }
  );
});

router.put("/price/:id", (req, res) => {
  //update purchase price of a product
  const { id } = req.params;
  const { purchasePrice } = req.body;
  if (!purchasePrice) {
    return res.status(400).json({ error: "Required fields are missing" });
  }

  db.run(
    `UPDATE product SET purchasePrice = ? WHERE id = ?`,
    [purchasePrice, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ message: "Product updated successfully" });
    }
  );
});

// 🚀 Delete a product
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM product WHERE id = ?`, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  });
});

router.post("/addQuantity", (req, res) => {
  const { id, quantity } = req.body;

  if (!id || !quantity) {
    return res.status(400).json({ error: "Required fields are missing" });
  }

  db.run(
    `UPDATE product SET quantity = quantity + ? WHERE id = ?`,
    [quantity, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ message: "Product quantity updated successfully" });
    }
  );
});

router.post("/removeQuantity", (req, res) => {
  const { id, quantity } = req.body;

  if (!id || !quantity) {
    return res.status(400).json({ error: "Required fields are missing" });
  }

  db.run(
    `UPDATE product SET quantity = quantity - ? WHERE id = ?`,
    [quantity, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ message: "Product quantity updated successfully" });
    }
  );
});

module.exports = router;