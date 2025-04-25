const express = require("express");
const router = express.Router();
const db = require("../models/database");

const safeParseJSON = (data) => {
  try {
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch (e) {
    console.error("Error parsing JSON field:", e.message);
    return null; // Return null if parsing fails
  }
};

router.post("/", (req, res) => {
  const { trans_id, date, amount, creditAccount, debitAccount, notes, voucher, checkNumber, img } = req.body;

  if (!trans_id || !date || !amount || !creditAccount || !debitAccount || !voucher) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `
    INSERT INTO transactions (trans_id, date, amount, creditAccount, debitAccount, notes, voucher, checkNumber, img)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [trans_id, date, amount, JSON.stringify(creditAccount), JSON.stringify(debitAccount), notes, voucher, checkNumber, img],
    function (err) {
      if (err) {
        console.error("Error creating transaction:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: "Transaction created successfully", id: this.lastID });
    }
  );
});
 
router.get("/", (req, res) => {
  db.all("SELECT * FROM transactions ORDER BY date ASC", [], (err, rows) => {
    if (err) {
      console.error("Error fetching transactions:", err.message);
      return res.status(500).json({ error: err.message });
    }

    console.log("Fetched transactions successfully.");

    const formattedResponse = rows.map((row, index) => ({
      sNo: index + 1, // Serial number
      id: row.id,
      trans_id: row.trans_id,
      date: row.date,
      amount: row.amount,
      creditAccount: safeParseJSON(row.creditAccount),
      debitAccount: safeParseJSON(row.debitAccount),
      notes: row.notes,
      voucher: row.voucher,
      checkNumber: row.checkNumber,
      img: row.img
    }));

    res.json({
      totalData: formattedResponse.length,
      data: formattedResponse
    });
  });
});
 
router.get("/:id", (req, res) => {
  const { id } = req.params;

  db.get("SELECT * FROM transactions WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error("Error fetching transaction:", err.message);
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json({
      id: row.id,
      trans_id: row.trans_id,
      date: row.date,
      amount: row.amount,
      creditAccount: safeParseJSON(row.creditAccount),
      debitAccount: safeParseJSON(row.debitAccount),
      notes: row.notes,
      voucher: row.voucher,
      checkNumber: row.checkNumber,
      img: row.img
    });
  });
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { trans_id, date, amount, creditAccount, debitAccount, notes, voucher, checkNumber } = req.body;

  const query = `
    UPDATE transactions 
    SET trans_id = ?, date = ?, amount = ?, creditAccount = ?, debitAccount = ?, notes = ?, voucher = ?, checkNumber = ?
    WHERE id = ?
  `;

  db.run(
    query,
    [trans_id, date, amount, JSON.stringify(creditAccount), JSON.stringify(debitAccount), notes, voucher, checkNumber, id],
    function (err) {
      if (err) {
        console.error("Error updating transaction:", err.message);
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      res.json({ message: "Transaction updated successfully" });
    }
  );
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM transactions WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Error deleting transaction:", err.message);
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted successfully" });
  });
});

module.exports = router;
