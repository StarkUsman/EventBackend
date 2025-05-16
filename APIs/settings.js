const express = require("express");
const router = express.Router();
const db = require("../models/database");

// CREATE a new setting
router.post("/", (req, res) => {
  const {
    name,
    phoneNumber = null,
    phoneNumber1 = null,
    email = null,
    address1 = null,
    address2 = null,
    country = null,
    state = null,
    city = null,
    zip = null,
    logo = null,
    icon = null,
    favicon = null,
  } = req.body;

  db.run(
    `INSERT INTO settings (name, phoneNumber, phoneNumber1, email, address1, address2, country, state, city, zip, logo, icon, favicon) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, phoneNumber, phoneNumber1, email, address1, address2, country, state, city, zip, logo, icon, favicon],
    function (err) {
      if (err) {
        console.error("Error creating setting:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: "Setting created successfully" });
    }
  );
});

// GET all settings
router.get("/", (req, res) => {
  db.all("SELECT rowid as id, * FROM settings", [], (err, rows) => {
    if (err) {
      console.error("Error fetching settings:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: rows, totalData: rows.length });
  });
});

// GET a single setting by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;

  db.get("SELECT rowid as id, * FROM settings WHERE rowid = ?", [id], (err, row) => {
    if (err) {
      console.error("Error fetching setting:", err.message);
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: "Setting not found" });
    }
    res.json({ data: row });
  });
});

// UPDATE a setting
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const {
    name,
    phoneNumber = null,
    phoneNumber1 = null,
    email = null,
    address1 = null,
    address2 = null,
    country = null,
    state = null,
    city = null,
    zip = null,
    logo = null,
    icon = null,
    favicon = null,
  } = req.body;

  db.run(
    `UPDATE settings SET 
      name = ?, phoneNumber = ?, phoneNumber1 = ?, email = ?, address1 = ?, address2 = ?, country = ?, 
      state = ?, city = ?, zip = ?, logo = ?, icon = ?, favicon = ? 
     WHERE rowid = ?`,
    [name, phoneNumber, phoneNumber1, email, address1, address2, country, state, city, zip, logo, icon, favicon, id],
    function (err) {
      if (err) {
        console.error("Error updating setting:", err.message);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json({ message: "Setting updated successfully" });
    }
  );
});

// DELETE a setting
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM settings WHERE rowid = ?", [id], function (err) {
    if (err) {
      console.error("Error deleting setting:", err.message);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Setting not found" });
    }
    res.json({ message: "Setting deleted successfully" });
  });
});

module.exports = router;
