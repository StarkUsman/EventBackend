const express = require("express");
const router = express.Router();
const db = require("../models/database");

// 🚀 Get all purchases
router.get("/", (req, res) => {
  db.all("SELECT * FROM purchaseReturn ORDER BY id ASC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Format response like units API
    const formattedData = rows.map((purchase, index) => ({
      sNo: index + 1,
      id: purchase.id,
      purch_id: purchase.purch_id,
      vendor: JSON.parse(purchase.vendor), // Convert JSON string to object
      total_amount: purchase.total_amount,
      paymentmode: purchase.paymentmode,
      purchase_date: purchase.purchase_date,
      due_date: purchase.due_date,
      status: purchase.status,
      reference_no: purchase.reference_no,
      invoice_sr_no: purchase.invoice_sr_no,
      products: JSON.parse(purchase.products), // Convert JSON string to object
      signature_text: purchase.signature_text,
      signature_img: purchase.signature_img,
      notes: purchase.notes
    }));

    res.json({ data: formattedData, totalData: formattedData.length });
  });
});

// 🚀 Get a single purchase by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM purchaseReturn WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: "Purchase not found" });
    }
    row.vendor = JSON.parse(row.vendor);
    row.products = JSON.parse(row.products);
    res.json(row);
  });
});

// 🚀 Create a new purchase
router.post("/", (req, res) => {
  const {
    purch_id,
    vendor,
    total_amount,
    paymentmode,
    purchase_date,
    due_date,
    status,
    reference_no,
    invoice_sr_no,
    products,
    signature_text,
    signature_img,
    notes
  } = req.body;

  if (!purch_id || !vendor || !total_amount || !paymentmode || !purchase_date || !due_date || !status || !products) {
    return res.status(400).json({ error: "Required fields are missing" });
  }

  db.run(
    `INSERT INTO purchaseReturn (purch_id, vendor, total_amount, paymentmode, purchase_date, due_date, status, reference_no, invoice_sr_no, products, signature_text, signature_img, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`,
    [
      purch_id,
      JSON.stringify(vendor), // Convert to JSON string
      total_amount,
      paymentmode,
      purchase_date,
      due_date,
      status,
      reference_no || null,
      invoice_sr_no || null,
      JSON.stringify(products), // Convert to JSON string
      signature_text || null,
      signature_img || null,
      notes || null
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        id: this.lastID,
        purch_id,
        vendor,
        total_amount,
        paymentmode,
        purchase_date,
        due_date,
        status,
        reference_no,
        invoice_sr_no,
        products,
        signature_text,
        signature_img,
        notes
      });
    }
  );
});

// 🚀 Update a purchase
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const {
    purch_id,
    vendor,
    total_amount,
    paymentmode,
    purchase_date,
    due_date,
    status,
    reference_no,
    invoice_sr_no,
    products,
    signature_text,
    signature_img,
    notes
  } = req.body;

  if (!purch_id || !vendor || !total_amount || !paymentmode || !purchase_date || !due_date || !status || !products) {
    return res.status(400).json({ error: "Required fields are missing" });
  }

  db.run(
    `UPDATE purchaseReturn 
     SET purch_id = ?, vendor = ?, total_amount = ?, paymentmode = ?, purchase_date = ?, due_date = ?, status = ?, reference_no = ?, invoice_sr_no = ?, products = ?, signature_text = ?, signature_img = ?, notes = ? 
     WHERE id = ?`,
    [
      purch_id,
      JSON.stringify(vendor),
      total_amount,
      paymentmode,
      purchase_date,
      due_date,
      status,
      reference_no,
      invoice_sr_no,
      JSON.stringify(products),
      signature_text,
      signature_img,
      notes,
      id
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

router.put("/status/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Required fields are missing" });
  }

  db.run(
    `UPDATE purchaseReturn SET status = ? WHERE id = ?`,
    [status, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Purchase not found" });
      }
      res.json({ message: "Purchase status updated successfully" });
    }
  );
});

// 🚀 Delete a purchase
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM purchaseReturn WHERE id = ?`, [id], function (err) {
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