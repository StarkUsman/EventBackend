const express = require("express");
const db = require("../models/database");
const router = express.Router();

// Get all ledger entries (No formatting)
router.get("/", (req, res) => {
  db.all("SELECT * FROM ledger ORDER BY createdAt ASC", [], (err, rows) => {
    if (err) {
      console.error("Error fetching ledger entries:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json({ data: rows, totalData: rows.length });
    }
  });
});

// get ledger by id where amountCredit is not 0
router.get("/credit/:id", (req, res) => {
  const { id } = req.params;
  db.all("SELECT * FROM ledger WHERE vendor_id = ? AND amountCredit > 0 ORDER BY createdAt ASC", [id], (err, rows) => {
    if (err) {
      console.error("Error fetching ledger entries:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json({ data: rows, totalData: rows.length });
    }
  });
});

// get ledger where amountDebit is not 0
router.get("/debit/:id", (req, res) => {
  const { id } = req.params;
  db.all("SELECT * FROM ledger WHERE vendor_id = ? AND amountDebit > 0 ORDER BY createdAt ASC", [id], (err, rows) => {
    if (err) {
      console.error("Error fetching ledger entries:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json({ data: rows, totalData: rows.length });
    }
  });
});

// Get a specific ledger entry by ID
router.get("/ledger/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM ledger WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error(`Error fetching ledger entry with ID ${id}:`, err.message);
      res.status(500).json({ error: err.message });
    } else if (row) {
      res.json(row);
    } else {
      res.status(404).json({ message: "Ledger entry not found" });
    }
  });
});

// Get all ledger entries for a specific vendor (ordered by createdAt ASC)
// (`http://localhost:3000/ledger/${id}?startDate=${startDate}&endDate=${endDate}&vendorName=${vendorName}`);
router.get("/:vendor_id", (req, res) => {
  const { vendor_id } = req.params;
  const { startDate, endDate, vendorName } = req.query;
  
  if (startDate && endDate && vendorName) {
    db.all(
      `SELECT * FROM ledger WHERE vendor_id = ? AND createdAt BETWEEN ? AND ? AND name = ? ORDER BY createdAt ASC`,
      [vendor_id, startDate, endDate, vendorName],
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
      `SELECT * FROM ledger WHERE vendor_id = ? AND createdAt BETWEEN ? AND ? ORDER BY createdAt ASC`,
      [vendor_id, startDate, endDate],
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
  else if (vendorName) {
    db.all(
      `SELECT * FROM ledger WHERE vendor_id = ? AND name = ? ORDER BY createdAt ASC`,
      [vendor_id, vendorName],
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
    db.all("SELECT * FROM ledger WHERE vendor_id = ? ORDER BY createdAt ASC", [vendor_id], (err, rows) => {
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
  const { name, purch_id, vendor_id, amountDebit, amountCredit } = req.body;
  if (!name || !vendor_id || (amountDebit === undefined && amountCredit === undefined)) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Ensure name is one of the allowed values
  const allowedNames = ["SRV", "CPV", "BPV", "GV", "OB", "PRV"];
  if (!allowedNames.includes(name)) {
    return res.status(400).json({ error: "Invalid name. Must be one of SRV, CPV, BPV, GV, PRV" });
  }

  // Fetch vendor balance and proceed only after getting the result
  db.get("SELECT balance FROM vendors WHERE vendor_id = ?", [vendor_id], (err, row) => {
    if (err) {
      console.error("Error fetching vendor balance:", err.message);
      return res.status(500).json({ error: err.message });
    }

    let balance = row ? row.balance : 0;

    if (name === "OB") {
      balance = amountCredit != 0 ? amountCredit : -amountDebit;
    } else if (name === "SRV") {
      balance -= amountDebit;
    } else {
      balance += amountCredit;
    }

    // Insert into ledger **inside** the callback to ensure correct balance usage
    db.run(
      `INSERT INTO ledger (name, purch_id, vendor_id, amountDebit, amountCredit, balance) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, purch_id, vendor_id, amountDebit || 0, amountCredit || 0, balance],
      function (err) {
        if (err) {
          console.error("Error creating ledger entry:", err.message);
          return res.status(500).json({ error: err.message });
        }

        // Now update vendor balance
        db.run("UPDATE vendors SET balance = ? WHERE vendor_id = ?", [balance, vendor_id], function (err) {
          if (err) {
            console.error("Error updating vendor balance:", err.message);
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
  const { name, purch_id, vendor_id, amountDebit, amountCredit } = req.body;

  if (!name || !vendor_id || (amountDebit === undefined && amountCredit === undefined) || !purch_id) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Ensure name is one of the allowed values
  const allowedNames = ["SRV", "CPV", "BPV", "GV", "ER"];
  if (!allowedNames.includes(name)) {
    return res.status(400).json({ error: "Invalid name. Must be one of SRV, CPV, BPV, GV." });
  }

  // Fetch vendor balance and proceed only after getting the result
  db.get("SELECT balance FROM vendors WHERE vendor_id = ?", [vendor_id], (err, row) => {
    if (err) {
      console.error("Error fetching vendor balance:", err.message);
      return res.status(500).json({ error: err.message });
    }

    let balance = row ? row.balance : 0; // Ensure balance is initialized correctly

    // Update balance based on transaction type
    let updatedName = name;
    if (name === "SRV") {
      balance -= amountDebit;
    } else if (name === "ER") {
      balance += amountDebit;
      updatedName = "SRV";
    } else {
      balance += amountCredit;
    }

    // Update ledger **inside** the callback to ensure correct balance usage
    db.run(
      `UPDATE ledger SET name = ?, purch_id = ?, vendor_id = ?, amountDebit = ?, amountCredit = ?, balance = ? WHERE id = ?`,
      [updatedName, purch_id, vendor_id, amountDebit || 0, amountCredit || 0, balance, id],
      function (err) {
        if (err) {
          console.error("Error updating ledger entry:", err.message);
          return res.status(500).json({ error: err.message });
        }

        // Now update vendor balance
        db.run("UPDATE vendors SET balance = ? WHERE vendor_id = ?", [balance, vendor_id], function (err) {
          if (err) {
            console.error("Error updating vendor balance:", err.message);
          }
        });

        res.json({ message: "Ledger entry updated successfully" });
      }
    );
  },);
});

// Delete a ledger entry
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM ledger WHERE id = ?", [id], function (err) {
    if (err) {
      console.error(`Error deleting ledger entry with ID ${id}:`, err.message);
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ message: "Ledger entry not found" });
    } else {
      res.json({ message: "Ledger entry deleted successfully." });
    }
  });
});

module.exports = router;