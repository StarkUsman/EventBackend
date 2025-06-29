const express = require("express");
const router = express.Router();
const db = require("../models/database");
const dayjs = require('dayjs');

// CREATE salary
router.post("/", (req, res) => {
  const { vendor, menuItems = [], amount = 0, variableAmount = 0 } = req.body;

  db.run(
    `INSERT INTO salaries (vendor, menuItems, amount, variableAmount) VALUES (?, ?, ?, ?)`,
    [JSON.stringify(vendor), JSON.stringify(menuItems), amount, variableAmount],
    function (err) {
      if (err) {
        console.error("Error creating salary record:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// GET all salaries
router.get("/", (req, res) => {
  db.all("SELECT * FROM salaries", [], (err, rows) => {
    if (err) {
      console.error("Error fetching salaries:", err.message);
      return res.status(500).json({ error: err.message });
    }

    const formatted = rows.map((row, i) => ({
      ...row,
      sNo: i + 1,
      vendor: JSON.parse(row.vendor),
      menuItems: row.menuItems ? JSON.parse(row.menuItems) : []
    }));

    res.json({ data: formatted, totalData: formatted.length });
  });
});


// calculate salary
router.get("/calculate", async (req, res) => {
  try {
    // Fetch all salaries
    const salaries = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM salaries', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Fetch all bookings
    const bookings = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM bookings', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const result = salaries.map((salary) => {
      let totalSalary = 0;
      const salaryMenuItems = salary.menuItems ? JSON.parse(salary.menuItems) : [];
      const salaryMenuItemIds = salaryMenuItems.map(item => item.menu_item_id);
      const lastPaidDate = salary.lastSalaryPaidDate || '1970-01-01';
      salary.dashboardDate = bookings[0]?.dashboardDate || dayjs().format('YYYY-MM-DD');

      // Filter bookings after lastSalaryPaidDate
      const relevantBookings = bookings.filter(booking => 
        dayjs(booking.dashboardDate).isAfter(dayjs(lastPaidDate)) && dayjs(booking.dashboardDate).isBefore(dayjs().add(1, 'day'))
      );

      for (const booking of relevantBookings) {
        const bookingMenuItems = booking.menu_items_ids ? JSON.parse(booking.menu_items_ids) : [];
        const numberOfPersons = booking.number_of_persons || 1;

        const hasMenuItemMatch = salaryMenuItemIds.some(id => bookingMenuItems.includes(id));

        if (hasMenuItemMatch) {
          // menu item match
          if (salary.variableAmount && salary.variableAmount > 0) {
            totalSalary += salary.variableAmount * numberOfPersons;
          } else if (salary.amount && salary.amount > 0) {
            totalSalary += salary.amount * numberOfPersons;
          }
        } else {
          // no menu item match
          if (salary.amount && salary.amount > 0) {
            totalSalary += salary.amount * numberOfPersons;
          } else if (salary.amount === 0 && salary.variableAmount > 0) {
            totalSalary += 0; // explicitly zero
          }
        }
      }

      return {
        id: salary.id,
        vendor: JSON.parse(salary.vendor),
        totalSalaryCalculated: totalSalary,
        lastSalaryPaidDate: dayjs(salary.lastSalaryPaidDate).format('YYYY-MM-DD'),
        dashboardDate: dayjs(salary.dashboardDate).format('YYYY-MM-DD'),
      };
    });

    res.json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

// GET salary by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;

  db.get("SELECT * FROM salaries WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error("Error fetching salary:", err.message);
      return res.status(500).json({ error: err.message });
    }
    if (!row) return res.status(404).json({ message: "Salary not found" });

    res.json({
      ...row,
      vendor: JSON.parse(row.vendor),
      menuItems: row.menuItems ? JSON.parse(row.menuItems) : []
    });
  });
});

// UPDATE salary
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { vendor, menuItems = [], amount = 0, variableAmount = 0, lastSalaryPaidDate } = req.body;

  db.run(
    `UPDATE salaries SET vendor = ?, menuItems = ?, amount = ?, variableAmount = ?, lastSalaryPaidDate = ? WHERE id = ?`,
    [JSON.stringify(vendor), JSON.stringify(menuItems), amount, variableAmount, lastSalaryPaidDate, id],
    function (err) {
      if (err) {
        console.error("Error updating salary:", err.message);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0)
        return res.status(404).json({ message: "Salary not found" });

      res.json({ message: "Salary updated successfully" });
    }
  );
});

// DELETE salary
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM salaries WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Error deleting salary:", err.message);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0)
      return res.status(404).json({ message: "Salary not found" });

    res.json({ message: "Salary deleted successfully" });
  });
});

module.exports = router;
