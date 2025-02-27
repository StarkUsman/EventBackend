const express = require("express");
const db = require("../models/database");
const router = express.Router();

// Get all ledger entries (No formatting)
router.get("/", (req, res) => {
  db.all("SELECT * FROM ledger ORDER BY createdAt DESC", [], (err, rows) => {
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
  db.all("SELECT * FROM ledger WHERE vendor_id = ? AND amountCredit > 0 ORDER BY createdAt DESC", [id], (err, rows) => {
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
  db.all("SELECT * FROM ledger WHERE vendor_id = ? AND amountDebit > 0 ORDER BY createdAt DESC", [id], (err, rows) => {
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

// Get all ledger entries for a specific vendor (ordered by createdAt DESC)
// (`http://localhost:3000/ledger/${id}?startDate=${startDate}&endDate=${endDate}&vendorName=${vendorName}`);
router.get("/:vendor_id", (req, res) => {
  const { vendor_id } = req.params;
  const { startDate, endDate, vendorName } = req.query;
  
  if (startDate && endDate && vendorName) {
    db.all(
      `SELECT * FROM ledger WHERE vendor_id = ? AND createdAt BETWEEN ? AND ? AND name = ? ORDER BY createdAt DESC`,
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
      `SELECT * FROM ledger WHERE vendor_id = ? AND createdAt BETWEEN ? AND ? ORDER BY createdAt DESC`,
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
      `SELECT * FROM ledger WHERE vendor_id = ? AND name = ? ORDER BY createdAt DESC`,
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
    db.all("SELECT * FROM ledger WHERE vendor_id = ? ORDER BY createdAt DESC", [vendor_id], (err, rows) => {
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
  const { name, purch_id, vendor_id, amountDebit, amountCredit, balance } = req.body;

  if (!name || !vendor_id || amountDebit === undefined || amountCredit === undefined || balance === undefined || !purch_id) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Ensure name is one of the allowed values
  const allowedNames = ["SRV", "CPV", "BPV", "GV"];
  if (!allowedNames.includes(name)) {
    return res.status(400).json({ error: "Invalid name. Must be one of SRV, CPV, BPV, GV." });
  }

  db.run(
    `INSERT INTO ledger (name, purch_id, vendor_id, amountDebit, amountCredit, balance) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, purch_id, vendor_id, amountDebit, amountCredit, balance],
    function (err) {
      if (err) {
        console.error("Error creating ledger entry:", err.message);
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json({ id: this.lastID });
      }
    }
  );
});

// Update a ledger entry
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, vendor_id, amountDebit, amountCredit, balance } = req.body;

  if (!name || !vendor_id || amountDebit === undefined || amountCredit === undefined || balance === undefined) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Ensure name is one of the allowed values
  const allowedNames = ["SRV", "CPV", "BPV", "GV"];
  if (!allowedNames.includes(name)) {
    return res.status(400).json({ error: "Invalid name. Must be one of SRV, CPV, BPV, GV." });
  }

  db.run(
    `UPDATE ledger SET 
      name = ?, 
      vendor_id = ?, 
      amountDebit = ?, 
      amountCredit = ?, 
      balance = ? 
     WHERE id = ?`,
    [name, vendor_id, amountDebit, amountCredit, balance, id],
    function (err) {
      if (err) {
        console.error(`Error updating ledger entry with ID ${id}:`, err.message);
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ message: "Ledger entry not found" });
      } else {
        res.json({ message: "Ledger entry updated successfully." });
      }
    }
  );
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