const express = require("express");
const router = express.Router();
const db = require("../models/database");

router.post("/", (req, res) => {
  const { category, description, subcategory } = req.body;

  if (!category) {
    return res.status(400).json({ error: "Category name is required." });
  }

  const sql = `INSERT INTO Acategory (category, description, subcategory) VALUES (?, ?, ?)`;
  db.run(sql, [category, description, JSON.stringify(subcategory)], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({ id: this.lastID, category, description });
  });
});

// 🟡 GET ALL CATEGORIES (Formatted)
router.get("/", (req, res) => {
  db.all("SELECT * FROM Acategory", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }


    const formattedRows = rows.map((row, index) => ({
      sNo: index + 1,
      id: row.id,
      category: row.category,
      subcategory: JSON.parse(row.subcategory || '[]'),
      description: row.description
    }));

    res.json({
      data: formattedRows,
      totalData: rows.length
    });
  });
});

//get category by name where category.category to lower case == "expense"
router.get("/EXPENSE", (req, res) => {
  db.get("SELECT * FROM Acategory WHERE LOWER(category) = 'expense'", [], (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (!row) {
      return res.status(404).json({ error: "Category not found." });
    }

    const formattedRow = {
      ...row,
      subcategory: JSON.parse(row.subcategory || '[]')
    }

    res.json(formattedRow);
  })
});

// 🔵 GET CATEGORY BY ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM Acategory WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (!row) {
      return res.status(404).json({ error: "Category not found." });
    }
    const formattedRow = {
      ...row,
      subcategory: JSON.parse(row.subcategory || '[]')
    }

    res.json(formattedRow);
  });
});

// 🟠 UPDATE CATEGORY
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { category, description, subcategory } = req.body;

  if (!category) {
    return res.status(400).json({ error: "Category name is required." });
  }

  const sql = `UPDATE Acategory SET category = ?, description = ?, subcategory = ? WHERE id = ?`;
  db.run(sql, [category, description, JSON.stringify(subcategory), id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Category not found." });
    }

    res.json({ id, category, description });
  });
});

// 🔴 DELETE CATEGORY
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM Acategory WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Category not found." });
    }

    res.json({ message: "Category deleted successfully." });
  });
});

module.exports = router;
