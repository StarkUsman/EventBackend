const express = require("express");
const router = express.Router();
const db = require("../models/database");

// 🟢 CREATE VOUCHER
router.post("/", (req, res) => {
  const { name, symbol } = req.body;

  if (!name || !symbol) {
    return res.status(400).json({ error: "Name and symbol are required." });
  }

  const sql = `INSERT INTO vouchers (name, symbol) VALUES (?, ?)`;
  db.run(sql, [name, symbol], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({ id: this.lastID, name, symbol });
  });
});

// 🟡 GET ALL VOUCHERS (Formatted)
router.get("/", (req, res) => {
  db.all("SELECT * FROM vouchers", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }


    const formattedRows = rows.map((row, index) => ({
      sNo: index + 1,
      id: row.id,
      name: row.name,
      symbol: row.symbol
    }));

    res.json({
      data: formattedRows,
      totalData: rows.length
    });
  });
});

// 🔵 GET VOUCHER BY ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM vouchers WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (!row) {
      return res.status(404).json({ error: "Voucher not found." });
    }

    res.json(row);
  });
});

// 🟠 UPDATE VOUCHER
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, symbol } = req.body;

  if (!name || !symbol) {
    return res.status(400).json({ error: "Name and symbol are required." });
  }

  const sql = `UPDATE vouchers SET name = ?, symbol = ? WHERE id = ?`;
  db.run(sql, [name, symbol, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Voucher not found." });
    }

    res.json({ id, name, symbol });
  });
});

// 🔴 DELETE VOUCHER
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM vouchers WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Voucher not found." });
    }

    res.json({ message: "Voucher deleted successfully." });
  });
});

module.exports = router;
