const express = require("express");
const db = require("../models/database");
const router = express.Router();

// Get all ledger entries
router.get("/", (req, res) => {
  db.all("SELECT * FROM inventoryLedger ORDER BY createdAt ASC", [], (err, rows) => {
    if (err) {
      console.error("Error fetching ledger entries:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      // res.json({ data: rows, totalData: rows.length });
      const formattedResponse = rows.map((row) => ({
          ...row,
          user: JSON.parse(row.user || '{}'),
        }));
      res.json({ data: formattedResponse, totalData: rows.length });
    };
  });
});

// get ledger by id where stockIn is not 0
router.get("/stockIn/:id", (req, res) => {
  const { id } = req.params;
  db.all("SELECT * FROM inventoryLedger WHERE product_id = ? AND stockIn > 0 ORDER BY createdAt ASC", [id], (err, rows) => {
    if (err) {
      console.error("Error fetching ledger entries:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      // res.json({ data: rows, totalData: rows.length });
      const formattedResponse = rows.map((row) => ({
          ...row,
          user: JSON.parse(row.user || '{}'),
        }));
      res.json({ data: formattedResponse, totalData: rows.length });
    }
  });
});

// get ledger where stockOut is not 0
router.get("/stockOut/:id", (req, res) => {
  const { id } = req.params;
  db.all("SELECT * FROM inventoryLedger WHERE product_id = ? AND stockOut > 0 ORDER BY createdAt ASC", [id], (err, rows) => {
    if (err) {
      console.error("Error fetching ledger entries:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      // res.json({ data: rows, totalData: rows.length });
      const formattedResponse = rows.map((row) => ({
          ...row,
          user: JSON.parse(row.user || '{}'),
        }));
      res.json({ data: formattedResponse, totalData: rows.length });
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
      `SELECT * FROM inventoryLedger WHERE product_id = ? AND createdAt BETWEEN ? AND ? AND name = ? ORDER BY createdAt ASC`,
      [product_id, startDate, endDate, name],
      (err, rows) => {
        if (err) {
          console.error("Error fetching ledger entries:", err.message);
          res.status(500).json({ error: err.message });
        } else {
          // res.json({ data: rows, totalData: rows.length });
          const formattedResponse = rows.map((row) => ({
            ...row,
            user: JSON.parse(row.user || '{}'),
          }));
          res.json({ data: formattedResponse, totalData: rows.length });
        }
      }
    );
  } else if (startDate && endDate) {
    db.all(
      `SELECT * FROM inventoryLedger WHERE product_id = ? AND createdAt BETWEEN ? AND ? ORDER BY createdAt ASC`,
      [product_id, startDate, endDate],
      (err, rows) => {
        if (err) {
          console.error("Error fetching ledger entries:", err.message);
          res.status(500).json({ error: err.message });
        } else {
          // res.json({ data: rows, totalData: rows.length });
          const formattedResponse = rows.map((row) => ({
            ...row,
            user: JSON.parse(row.user || '{}'),
          }));
          res.json({ data: formattedResponse, totalData: rows.length });
        }
      }
    );
  }
  else if (name) {
    db.all(
      `SELECT * FROM inventoryLedger WHERE product_id = ? AND name = ? ORDER BY createdAt ASC`,
      [product_id, name],
      (err, rows) => {
        if (err) {
          console.error("Error fetching ledger entries:", err.message);
          res.status(500).json({ error: err.message });
        } else {
          // res.json({ data: rows, totalData: rows.length });
          const formattedResponse = rows.map((row) => ({
            ...row,
            user: JSON.parse(row.user || '{}'),
          }));
          res.json({ data: formattedResponse, totalData: rows.length });
        }
      }
    );
  }
  else {
    db.all("SELECT * FROM inventoryLedger WHERE product_id = ? ORDER BY createdAt ASC", [product_id], (err, rows) => {
      if (err) {
        console.error("Error fetching ledger entries:", err.message);
        res.status(500).json({ error: err.message });
      } else {
        // res.json({ data: rows, totalData: rows.length });
        const formattedResponse = rows.map((row) => ({
          ...row,
          user: JSON.parse(row.user || '{}'),
        }));
        res.json({ data: formattedResponse, totalData: rows.length });
      }
    });
  }
});

// Create a new ledger entry
router.post("/", (req, res) => {
  
  const { name, purchasePrice, user, voucher, product_id, stockOut, stockIn } = req.body;
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
    // SIV = STOCK IN VOUCHER
    // SOV = STOCK OUT VOUCHER
    if (name === "SIV") {
      quantity += stockIn;
    } else if (name === "SOV" || name === "PRV") {
      quantity -= stockOut;
    }

    // let user = {};

    // Insert into ledger **inside** the callback to ensure correct balance usage
    db.run(
      `INSERT INTO inventoryLedger (name, user, purchasePrice, voucher, product_id, stockOut, stockIn, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, JSON.stringify(user) || '{}', purchasePrice, voucher, product_id, stockOut, stockIn, quantity],
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

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, purchasePrice, user, voucher, product_id, stockOut, stockIn } = req.body;

  if (!name || !purchasePrice || !voucher || !product_id || (!stockOut && !stockIn)) {
    console.log("All fields are required.");
    return res.status(400).json({ error: "All fields are required." });
  }

  db.get("SELECT quantity FROM product WHERE id = ?", [product_id], (err, row) => {
    if (err) {
      console.error("Error fetching product balance:", err.message);
      return res.status(500).json({ error: err.message });
    }
    // SIV = STOCK IN VOUCHER
    // SOV = STOCK OUT VOUCHER
    // get old ledger entry
    db.get("SELECT * FROM inventoryLedger WHERE id = ?", [id], (err, oldRow) => {
      if (err) {
        console.error("Error fetching old ledger entry:", err.message);
        return res.status(500).json({ error: err.message });
      }

      let quantity = row ? row.quantity : 0;
      if (oldRow) {
        if (oldRow.name === "SIV") {
          quantity -= oldRow.stockIn;
        } else if (oldRow.name === "SOV" || oldRow.name === "PRV") {
          quantity += oldRow.stockOut;
        }
      }

      if (name === "SIV") {
        quantity += stockIn;
      } else if (name === "SOV" || name === "PRV") {
        quantity -= stockOut;
      }

      db.run(
        `UPDATE inventoryLedger SET name = ?, user = ?, purchasePrice = ?, voucher = ?, product_id = ?, stockOut = ?, stockIn = ?, quantity = ? WHERE id = ?`,
        [name, JSON.stringify(user) || '{}', purchasePrice, voucher, product_id, stockOut, stockIn, quantity, id],
        function (err) {
          if (err) {
            console.error("Error updating inventoryLedger entry:", err.message);
            return res.status(500).json({ error: err.message });
          }

          // Now update product quantity
          db.run("UPDATE product SET quantity = ? WHERE id = ?", [quantity, product_id], function (err) {
            if (err) {
              console.error("Error updating inventoryLedger quantity:", err.message);
            }
          });

          res.status(200).json({ message: "Ledger entry updated successfully." });
        }
      );
    });

  },);

});

// get ledger by product id and name
router.get("/:id/purch/:purch_id", (req, res) => {
  const { id, purch_id } = req.params;
  db.all("SELECT * FROM inventoryLedger WHERE product_id = ? AND name = ? AND voucher = ?", [id, 'SIV', purch_id], (err, rows) => {
    if (err) {
      console.error("Error fetching ledger entries:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      // res.json({ data: rows, totalData: rows.length });
      const formattedResponse = rows.map((row) => ({
          ...row,
          user: JSON.parse(row.user || '{}'),
        }));
      res.json({ ledger: formattedResponse });
    }
  });
});

router.get("/:id/pret/:purch_id", (req, res) => {
  const { id, purch_id } = req.params;
  db.all("SELECT * FROM inventoryLedger WHERE product_id = ? AND name = ? AND voucher = ?", [id, 'PRV', purch_id], (err, rows) => {
    if (err) {
      console.error("Error fetching ledger entries:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      const formattedResponse = rows.map((row) => ({
          ...row,
          user: JSON.parse(row.user || '{}'),
        }));
      res.json({ ledger: formattedResponse });
    }
  });
});

router.get("/:id/expense/:purch_id", (req, res) => {
  const { id, purch_id } = req.params;
  db.all("SELECT * FROM inventoryLedger WHERE product_id = ? AND name = ? AND voucher = ?", [id, 'SOV', purch_id], (err, rows) => {
    if (err) {
      console.error("Error fetching ledger entries:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      const formattedResponse = rows.map((row) => ({
          ...row,
          user: JSON.parse(row.user || '{}'),
        }));
      res.json({ ledger: formattedResponse });
    }
  });
});

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