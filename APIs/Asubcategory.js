const express = require("express");
const router = express.Router();
const db = require("../models/database");

router.post("/", (req, res) => {
  const { subcategory, symbol } = req.body;

  if (!subcategory) {
    return res.status(400).json({ error: "Subcategory name is required." });
  }

  const sql = `INSERT INTO Asubcategory (subcategory, symbol) VALUES (?, ?)`;
  db.run(sql, [subcategory, symbol], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({ id: this.lastID, subcategory, symbol });
  });
});

// 🟡 GET ALL SUBCATEGORIES (Formatted)
router.get("/", (req, res) => {
  db.all("SELECT * FROM Asubcategory", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }


    const formattedRows = rows.map((row, index) => ({
      sNo: index + 1,
      id: row.id,
      subcategory: row.subcategory,
      symbol: row.symbol
    }));

    res.json({
      data: formattedRows,
      totalData: rows.length
    });
  });
});

// 🔵 GET SUBCATEGORY BY ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM Asubcategory WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (!row) {
      return res.status(404).json({ error: "Subcategory not found." });
    }

    res.json(row);
  });
});

// 🟠 UPDATE SUBCATEGORY
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { subcategory, symbol } = req.body;

  if (!subcategory) {
    return res.status(400).json({ error: "Subcategory name is required." });
  }

  const sql = `UPDATE Asubcategory SET subcategory = ?, symbol = ? WHERE id = ?`;
  db.run(sql, [subcategory, symbol, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Subcategory not found." });
    }

    res.json({ id, subcategory, symbol });
  });
});

// 🔴 DELETE SUBCATEGORY
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM Asubcategory WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Subcategory not found." });
    }

    res.json({ message: "Subcategory deleted successfully." });
  });
});

module.exports = router;
