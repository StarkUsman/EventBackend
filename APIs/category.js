const express = require("express");
const router = express.Router();
const db = require("../models/database");

// 🚀 Get all categories
router.get("/", (req, res) => {
  db.all("SELECT * FROM category ORDER BY id desc", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Format response similar to units API
    const formattedData = rows.map((category, index) => ({
      sNo: index + 1,
      id: category.id,
      category: category.category,
      img: category.img,
      total: category.total,
    }));

    res.json({ data: formattedData, totalData: formattedData.length });
  });
});

// 🚀 Get category by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM category WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(row);
  });
});

// 🚀 Create a new category
router.post("/", (req, res) => {
  const { category, img, total } = req.body;

  if (!category) {
    return res.status(400).json({ error: "Category is required" });
  }

  const imageN = img ? img : "assets/img/category/category-04.jpg";

  db.run(
    `INSERT INTO category (category, img, total) VALUES (?, ?, ?)`,
    [category, imageN, total || 0],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, category, img, total: total || "0" });
    }
  );
});

// 🚀 Update a category
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { category, img, total } = req.body;

  if (!category || !img) {
    return res.status(400).json({ error: "Category and image fields are required" });
  }

  db.run(
    `UPDATE category SET category = ?, img = ?, total = ? WHERE id = ?`,
    [category, img, total, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json({ message: "Category updated successfully" });
    }
  );
});

// 🚀 Delete a category
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM category WHERE id = ?`, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json({ message: "Category deleted successfully" });
  });
});

module.exports = router;
