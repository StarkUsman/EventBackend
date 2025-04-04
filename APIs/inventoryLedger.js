const express = require("express");
const db = require("../models/database");
const router = express.Router();

// Get all ledger entries
router.get("/", (req, res) => {
  db.all("SELECT * FROM inventoryLedger ORDER BY createdAt DESC", [], (err, rows) => {
    if (err) {
      console.error("Error fetching ledger entries:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json({ data: rows, totalData: rows.length });
    }
  });
});

// get ledger by id where stockIn is not 0
router.get("/stockIn/:id", (req, res) => {
  const { id } = req.params;
  db.all("SELECT * FROM inventoryLedger WHERE product_id = ? AND stockIn > 0 ORDER BY createdAt DESC", [id], (err, rows) => {
    if (err) {
      console.error("Error fetching ledger entries:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json({ data: rows, totalData: rows.length });
    }
  });
});

// get ledger where stockOut is not 0
router.get("/stockOut/:id", (req, res) => {
  const { id } = req.params;
  db.all("SELECT * FROM inventoryLedger WHERE product_id = ? AND stockOut > 0 ORDER BY createdAt DESC", [id], (err, rows) => {
    if (err) {
      console.error("Error fetching ledger entries:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json({ data: rows, totalData: rows.length });
    }
  });
});

// Get a specific ledger entry by ID
// router.get("/ledger/:id", (req, res) => {
//   const { id } = req.params;
//   db.get("SELECT * FROM ledger WHERE id = ?", [id], (err, row) => {
//     if (err) {
//       console.error(`Error fetching ledger entry with ID ${id}:`, err.message);
//       res.status(500).json({ error: err.message });
//     } else if (row) {
//       res.json(row);
//     } else {
//       res.status(404).json({ message: "Ledger entry not found" });
//     }
//   });
// });

// Get all ledger entries for a specific vendor (ordered by createdAt DESC)
// (`http://localhost:3000/ledger/${id}?startDate=${startDate}&endDate=${endDate}&vendorName=${vendorName}`);
router.get("/:product_id", (req, res) => {
  const { product_id } = req.params;
  const { startDate, endDate, name } = req.query;
  
  if (startDate && endDate && name) {
    db.all(
      `SELECT * FROM inventoryLedger WHERE product_id = ? AND createdAt BETWEEN ? AND ? AND name = ? ORDER BY createdAt DESC`,
      [product_id, startDate, endDate, name],
      (err, rows) => {
        if (err) {
          console.error("Error fetching ledger entries:", err.message);
          res.status(500).json({ error: err.message });
        } else {
          res.json({ data: rows, totalData: rows.length });
        }
      }
    );
  } else if (startDate && endDate) {
    db.all(
      `SELECT * FROM inventoryLedger WHERE product_id = ? AND createdAt BETWEEN ? AND ? ORDER BY createdAt DESC`,
      [product_id, startDate, endDate],
      (err, rows) => {
        if (err) {
          console.error("Error fetching ledger entries:", err.message);
          res.status(500).json({ error: err.message });
        } else {
          res.json({ data: rows, totalData: rows.length });
        }
      }
    );
  }
  else if (name) {
    db.all(
      `SELECT * FROM inventoryLedger WHERE product_id = ? AND name = ? ORDER BY createdAt DESC`,
      [product_id, name],
      (err, rows) => {
        if (err) {
          console.error("Error fetching ledger entries:", err.message);
          res.status(500).json({ error: err.message });
        } else {
          res.json({ data: rows, totalData: rows.length });
        }
      }
    );
  }
  else {
    console.log("Fetching inventoryLedger for product_id:", product_id);

    db.all("SELECT * FROM inventoryLedger WHERE product_id = ? ORDER BY createdAt DESC", [product_id], (err, rows) => {
      if (err) {
        console.error("Error fetching ledger entries:", err.message);
        res.status(500).json({ error: err.message });
      } else {
        res.json({ data: rows, totalData: rows.length });
      }
    });
  }
});

// Create a new ledger entry
router.post("/", (req, res) => {
  
  const { name, purchasePrice, voucher, product_id, stockOut, stockIn } = req.body;
  if (!name || !purchasePrice || !voucher || !product_id || (!stockOut && !stockIn)) {
    console.log("All fields are required.");
    return res.status(400).json({ error: "All fields are required." });
  }

  // Fetch product quantity and proceed only after getting the result
  db.get("SELECT quantity FROM product WHERE id = ?", [product_id], (err, row) => {
    if (err) {
      console.error("Error fetching product balance:", err.message);
      return res.status(500).json({ error: err.message });
    }

    let quantity = row ? row.quantity : 0;
    // PSV = PURCHASE STOCK VOUCHER
    // ESV = EXPENSE STOCK VOUCHER
    if (name === "PSV") {
      quantity += stockIn;
    } else if (name === "ESV") {
      quantity -= stockOut;
    }

    let user = {};

    // Insert into ledger **inside** the callback to ensure correct balance usage
    db.run(
      `INSERT INTO inventoryLedger (name, user, purchasePrice, voucher, product_id, stockOut, stockIn, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, user || null, purchasePrice, voucher, product_id, stockOut, stockIn, quantity],
      function (err) {
        if (err) {
          console.error("Error creating inventoryLedger entry:", err.message);
          return res.status(500).json({ error: err.message });
        }

        // Now update product quantity
        db.run("UPDATE product SET quantity = ? WHERE id = ?", [quantity, product_id], function (err) {
          if (err) {
            console.error("Error updating inventoryLedger quantity:", err.message);
          }
        });

        res.status(201).json({ id: this.lastID });
      }
    );
  });
});

// Update a ledger entry

// Delete a ledger entry
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM inventoryLedger WHERE id = ?", [id], function (err) {
    if (err) {
      console.error(`Error deleting inventoryLedger entry with ID ${id}:`, err.message);
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ message: "Ledger entry not found" });
    } else {
      res.json({ message: "Ledger entry deleted successfully." });
    }
  });
});

module.exports = router;