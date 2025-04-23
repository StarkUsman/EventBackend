const express = require("express");
const db = require("../models/database");
const router = express.Router();

// Get all vendors (Formatted Response)
router.get("/", (req, res) => {
  db.all("SELECT * FROM vendors ORDER BY vendor_id ASC", [], (err, rows) => {
    if (err) {
      console.error("Error fetching vendors:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      const formattedData = rows.map((vendor, index) => ({
        id: vendor.vendor_id,
        sNo: index + 1,
        name: vendor.name,
        name_urdu: vendor.name_urdu,
        email: vendor.email,
        phone: vendor.phone,
        category: JSON.parse(vendor.category),
        subcategory: vendor.subcategory,
        created: new Date(vendor.created_at).toLocaleString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        balance: vendor.balance.toFixed(2),  // returns balance as a string with 2 decimal places
        balanceNumber: vendor.balance,
      }));
      res.json({ data: formattedData, totalData: formattedData.length });
    }
  });
});

// Get all vendors where category = vendor
router.get("/category", (req, res) => {
  db.all("SELECT * FROM vendors ORDER BY vendor_id ASC", [], (err, rows) => {
    if (err) {
      console.error("Error fetching vendors:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      let filteredRows = rows.filter((vendor) => {
        // const category = JSON.parse(vendor.category);
        return vendor.subcategory && (vendor.subcategory === "vendor" || vendor.subcategory === "Vendor");
      });
      const formattedData = filteredRows.map((vendor, index) => ({
        id: vendor.vendor_id,
        sNo: index + 1,
        name: vendor.name,
        name_urdu: vendor.name_urdu,
        email: vendor.email,
        phone: vendor.phone,
        category: JSON.parse(vendor.category),
        subcategory: vendor.subcategory,
        created: new Date(vendor.created_at).toLocaleString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        balance: vendor.balance.toFixed(2),
      }));
      res.json({ data: formattedData, totalData: formattedData.length });
    }
  });
});

//get all vendors where category is Assets or assets
router.get("/assets", (req, res) => {
  db.all(`
    SELECT * FROM vendors
    WHERE JSON_EXTRACT(category, '$.category') = 'assets'
       OR JSON_EXTRACT(category, '$.category') = 'Assets'
    ORDER BY vendor_id ASC
  `, [], (err, rows) => {
    if (err) {
      console.error("Error fetching vendors:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      const formattedData = rows.map((vendor, index) => ({
        id: vendor.vendor_id,
        sNo: index + 1,
        name: vendor.name,
        name_urdu: vendor.name_urdu,
        email: vendor.email,
        phone: vendor.phone,
        category: JSON.parse(vendor.category),
        subcategory: vendor.subcategory,
        created: new Date(vendor.created_at).toLocaleString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        balance: vendor.balance.toFixed(2),
      }));
      res.json({ data: formattedData, totalData: formattedData.length });
    }
  });
});

// Get a specific vendor
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM vendors WHERE vendor_id = ?", [id], (err, row) => {
    if (err) {
      console.error(`Error fetching vendor with ID ${id}:`, err.message);
      res.status(500).json({ error: err.message });
    } else if (row) {
      const formattedResponse = {
        ...row,
        category: JSON.parse(row.category || '{}'),
      }
      res.json(formattedResponse);
    } else {
      res.status(404).json({ message: "Vendor not found" });
    }
  });
});

router.get("/name/:name", (req, res) => {
  const { name } = req.params;
  db.get("SELECT * FROM vendors WHERE name = ?", [name], (err, row) => {
    if (err) {
      console.error(`Error fetching vendor with name ${name}:`, err.message);
      res.status(500).json({ error: err.message });
    } else if (row) {
      const formattedResponse = {
        ...row,
        category: JSON.parse(row.category || '{}'),
      }
      res.json(formattedResponse);
    } else {
      res.status(404).json({ message: "Vendor with given name not found" });
    }
  });
});

// Create a new vendor
router.post("/", (req, res) => {
  const { name, name_urdu, email, phone, balance, category, subcategory } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: "Name is required." });
  }

  db.run(
    `INSERT INTO vendors (name, name_urdu, email, phone, balance, category, subcategory) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, name_urdu, email || null, phone || null, balance || 0, JSON.stringify(category) || null, subcategory || null],
    function (err) {
      if (err) {
        console.error("Error creating vendor:", err.message);
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json({ id: this.lastID });
      }
    }
  );
});

// Update a vendor
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, name_urdu, email, phone, balance, category, subcategory } = req.body;

  db.run(
    `UPDATE vendors SET 
      name = ?, 
      name_urdu = ?,
      email = ?, 
      phone = ?,
      balance = ?,
      category = ?,
      subcategory = ?
     WHERE vendor_id = ?`,
    [name, name_urdu, email, phone, balance, JSON.stringify(category), subcategory, id],
    function (err) {
      if (err) {
        console.error(`Error updating vendor with ID ${id}:`, err.message);
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ message: "Vendor not found" });
      } else {
        res.json({ message: "Vendor updated successfully." });
      }
    }
  );
});

// Delete a vendor
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM vendors WHERE vendor_id = ?", [id], function (err) {
    if (err) {
      console.error(`Error deleting vendor with ID ${id}:`, err.message);
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ message: "Vendor not found" });
    } else {
      res.json({ message: "Vendor deleted successfully." });
    }
  });
});

module.exports = router;
