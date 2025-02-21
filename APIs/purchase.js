const express = require("express");
const router = express.Router();
const db = require("../models/database");

// 🚀 Get all purchases
router.get("/", (req, res) => {
  db.all("SELECT * FROM purchase", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Format response similar to units API
    const formattedData = rows.map((purchase, index) => ({
      sNo: index + 1,
      purch_id: purchase.purch_id,
      vendor_id: purchase.vendor_id,
      purchase_date: purchase.purchase_date,
      due_date: purchase.due_date,
      reference_no: purchase.reference_no,
      invoice_sr_no: purchase.invoice_sr_no,
      products: JSON.parse(purchase.products), // Convert JSON string to object
      total_amount: purchase.total_amount,
      signature_text: purchase.signature_text,
      signature_img: purchase.signature_img
    }));

    res.json({ data: formattedData, totalData: formattedData.length });
  });
});

// 🚀 Get a purchase by ID
router.get("/:purch_id", (req, res) => {
  const { purch_id } = req.params;
  db.get("SELECT * FROM purchase WHERE purch_id = ?", [purch_id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: "Purchase not found" });
    }
    row.products = JSON.parse(row.products); // Convert stored JSON string to object
    res.json(row);
  });
});

// 🚀 Create a new purchase
router.post("/", (req, res) => {
  const {
    vendor_id,
    purchase_date,
    due_date,
    reference_no,
    invoice_sr_no,
    products,
    total_amount,
    signature_text,
    signature_img,
  } = req.body;

  if (!vendor_id || !purchase_date || !due_date || !products || !total_amount) {
    return res.status(400).json({ error: "Required fields are missing" });
  }

  db.run(
    `INSERT INTO purchase (vendor_id, purchase_date, due_date, reference_no, invoice_sr_no, products, total_amount, signature_text, signature_img) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      vendor_id,
      purchase_date,
      due_date,
      reference_no || null,
      invoice_sr_no || null,
      JSON.stringify(products), // Store as JSON string
      total_amount,
      signature_text || null,
      signature_img || null,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        purch_id: this.lastID,
        vendor_id,
        purchase_date,
        due_date,
        reference_no,
        invoice_sr_no,
        products,
        total_amount,
        signature_text,
        signature_img,
      });
    }
  );
});

// 🚀 Update a purchase
router.put("/:purch_id", (req, res) => {
  const { purch_id } = req.params;
  const {
    vendor_id,
    purchase_date,
    due_date,
    reference_no,
    invoice_sr_no,
    products,
    total_amount,
    signature_text,
    signature_img,
  } = req.body;

  if (!vendor_id || !purchase_date || !due_date || !products || !total_amount) {
    return res.status(400).json({ error: "Required fields are missing" });
  }

  db.run(
    `UPDATE purchase SET vendor_id = ?, purchase_date = ?, due_date = ?, reference_no = ?, invoice_sr_no = ?, 
     products = ?, total_amount = ?, signature_text = ?, signature_img = ? WHERE purch_id = ?`,
    [
      vendor_id,
      purchase_date,
      due_date,
      reference_no || null,
      invoice_sr_no || null,
      JSON.stringify(products), // Store as JSON string
      total_amount,
      signature_text || null,
      signature_img || null,
      purch_id,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Purchase not found" });
      }
      res.json({ message: "Purchase updated successfully" });
    }
  );
});

// 🚀 Delete a purchase
router.delete("/:purch_id", (req, res) => {
  const { purch_id } = req.params;

  db.run(`DELETE FROM purchase WHERE purch_id = ?`, [purch_id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Purchase not found" });
    }
    res.json({ message: "Purchase deleted successfully" });
  });
});

module.exports = router;
