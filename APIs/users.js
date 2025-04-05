const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../models/database");
const router = express.Router();

// Create a new user
router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, username, email, phone, password, role, status = 'inActive' } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (firstName, lastName, username, email, phone, password, role, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [firstName, lastName, username, email, phone, hashedPassword, role, status], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users
router.get("/", (req, res) => {
  db.all("SELECT * FROM users ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const usersWithoutPassword = rows.map(({ password, ...user }) => user);
    res.json({ data: usersWithoutPassword, totalData: rows.length });
  });
});

// Get single user by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ message: "User not found" });
    const { password, ...user } = row;
    res.json(user);
  });
});

// Update user (PUT)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, username, email, phone, role, status, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `
    UPDATE users 
    SET firstName = ?, lastName = ?, username = ?, email = ?, phone = ?, role = ?, status = ?, password = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(query, [firstName, lastName, username, email, phone, role, status, hashedPassword, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User updated successfully." });
  });
});

// Delete user
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully." });
  });
});

// Patch: Update password
router.patch("/:id/password", async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!password) return res.status(400).json({ error: "Password is required" });

  const hashedPassword = await bcrypt.hash(password, 10);

  db.run("UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?", [hashedPassword, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Password updated successfully." });
  });
});

// Patch: Update status
router.patch("/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.query;

  if (!status) return res.status(400).json({ error: "Status is required" });

  db.run("UPDATE users SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?", [status, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Status updated successfully." });
  });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const sqlInjectionRegex = /['"\\;]/;
  if (sqlInjectionRegex.test(username) || sqlInjectionRegex.test(password)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  db.get("SELECT id, firstName, lastName, username, email, phone, password, role, status FROM users WHERE username = ?", [username], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    res.status(200).json({ id: user.id, firstName: user.firstName, lastName: user.lastName, username: user.username, email: user.email, phone: user.phone, role: user.role, status: user.status  });

  });
});

module.exports = router;