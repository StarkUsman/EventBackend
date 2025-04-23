const express = require("express");
const router = express.Router();
const db = require("../models/database");

// 🚀 Get all expenses
router.get("/", (req, res) => {
  db.all("SELECT * FROM expense ORDER BY id ASC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Format response
    const formattedData = rows.map((expense, index) => ({
      sNo: index + 1,
      id: expense.id,
      purch_id: expense.purch_id,
      total_amount: expense.total_amount,
      purchase_date: expense.purchase_date,
      reference_no: expense.reference_no,
      products: JSON.parse(expense.products), // Convert JSON string to object
      signature_text: expense.signature_text,
      signature_img: expense.signature_img,
      notes: expense.notes
    }));

    res.json({ data: formattedData, totalData: formattedData.length });
  });
});

// 🚀 Get a single expense by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM expense WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: "Expense not found" });
    }
    row.products = JSON.parse(row.products);
    res.json(row);
  });
});

// 🚀 Create a new expense
router.post("/", (req, res) => {
  const {
    purch_id,
    total_amount,
    purchase_date,
    reference_no,
    products,
    signature_text,
    signature_img,
    notes
  } = req.body;

  if (!purch_id || !total_amount || !purchase_date || !products) {
    return res.status(400).json({ error: "Required fields are missing" });
  }

  db.run(
    `INSERT INTO expense (purch_id, total_amount, purchase_date, reference_no, products, signature_text, signature_img, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ? )`,
    [
      purch_id,
      total_amount,
      purchase_date,
      reference_no || null,
      JSON.stringify(products),
      signature_text || null,
      signature_img || null,
      notes || null
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      let response = {
        id: this.lastID,
        purch_id,
        total_amount,
        purchase_date,
        reference_no,
        products,
        signature_text,
        signature_img,
        notes
      };
      
      // db.get("SELECT * FROM vendors WHERE name = ?", ["FOOD EXPENSE"], (err, row) => {
      //   if (err) {
      //     console.error("Error fetching vendor balance:", err.message);
      //     return res.status(500).json({ error: err.message });
      //   }
      //   if(!row) {
      //     console.error("Vendor not found");
      //   }        
      //   let balance = row ? row.balance : 0;
      //   let vendor_id = row.vendor_id;
      //   balance = balance + total_amount;
      //   let ledgerName = "EXV";
      //   let amountCredit = total_amount;
      //   let amountDebit = 0;
        
      //   db.run(
      //     `INSERT INTO ledger (name, purch_id, vendor_id, amountDebit, amountCredit, balance) 
      //     VALUES (?, ?, ?, ?, ?, ?)`,
      //     [ledgerName, purch_id, vendor_id, amountDebit || 0, amountCredit || 0, balance],
      //     function (err) {
      //       if (err) {
      //         console.error("Error creating ledger entry:", err.message);
      //         return res.status(500).json({ error: err.message });
      //       }

      //       // Now update vendor balance
      //       db.run("UPDATE vendors SET balance = ? WHERE name = 'FOOD EXPENSE'", [balance], function (err) {
      //         if (err) {
      //           console.error("Error updating vendor balance:", err.message);
      //         }
      //       });
            
      //     }
      //   );
      // });
      res.status(201).json({ response });
    });
});

// 🚀 Update an expense
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const {
    purch_id,
    total_amount,
    purchase_date,
    reference_no,
    products,
    signature_text,
    signature_img,
    notes
  } = req.body;

  if (!purch_id || !total_amount || !purchase_date || !products) {
    return res.status(400).json({ error: "Required fields are missing" });
  }

  db.run(
    `UPDATE expense 
     SET purch_id = ?, total_amount = ?, purchase_date = ?, reference_no = ?, products = ?, signature_text = ?, signature_img = ?, notes = ? 
     WHERE id = ?`,
    [
      purch_id,
      total_amount,
      purchase_date,
      reference_no,
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
        return res.status(404).json({ error: "Expense not found" });
      }
      res.json({ message: "Expense updated successfully" });
    }
  );
});

// 🚀 Delete an expense
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM expense WHERE id = ?`, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Expense not found" });
    }
    res.json({ message: "Expense deleted successfully" });
  });
});

module.exports = router;
