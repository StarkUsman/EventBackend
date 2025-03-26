const express = require("express");
const db = require("../models/database");
const router = express.Router();
const convertDate = require("../utils/dateConverter");

// Get all bookings
router.get("/", (req, res) => {
  db.all("SELECT * FROM bookings ORDER BY booking_id DESC", [], (err, rows) => {
    if (err) {
      console.error("Error fetching bookings:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      console.log("Fetched bookings successfully.");
      const formattedResponse = rows.map((row) => ({
        ...row,
        SLOT: JSON.parse(row.SLOT)
      }));
      res.json(formattedResponse);
    }
  });
});

router.get("/formatted", (req, res) => {
  db.all("SELECT * FROM bookings ORDER BY booking_id DESC", [], (err, rows) => {
    if (err) {
      console.error("Error fetching vendors:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      const safeParseJSON = (data) => {
        try {
          return typeof data === "string" ? JSON.parse(data) : data;
        } catch (e) {
          console.error("Error parsing SLOT field:", e.message);
          return data;
        }
      };

      const formattedResponse = rows.map((row, index) => ({
        sNo: index + 1,
        ...row,
        SLOT: safeParseJSON(row.SLOT)
      }));

      res.json({
        totalDocs: formattedResponse.length,
        data: formattedResponse
      });
    }
  });
});

router.get("/upcoming", (req, res) => {
  let todayDate = new Date();
  let formattedDate = todayDate.toISOString().split('T')[0];
  db.all(
    "SELECT * FROM bookings WHERE dashboardDate >= ? ORDER BY dashboardDate ASC",
    [formattedDate],
    (err, rows) => {
      if (err) {
        console.error("Error fetching upcoming bookings:", err.message);
        return res.status(500).json({ error: err.message });
      }

      const safeParseJSON = (data) => {
        try {
          return typeof data === "string" ? JSON.parse(data) : data;
        } catch (e) {
          console.error("Error parsing SLOT field:", e.message);
          return data;
        }
      };

      // Format the response
      const formattedResponse = rows.map((row, index) => ({
        sNo: index + 1, // Serial number
        ...row,
        SLOT: safeParseJSON(row.SLOT)
      }));

      res.json({
        totalDocs: formattedResponse.length,
        data: formattedResponse
      });
    }
  );
});

const safeParseJSON = (data) => {
  try {
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch (e) {
    console.error("Error parsing SLOT field:", e.message);
    return data;
  }
};

// Get a specific booking
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM bookings WHERE booking_id = ?", [id], (err, row) => {
    if (err) {
      console.error(`Error fetching booking with ID ${id}:`, err.message);
      res.status(500).json({ error: err.message });
    } else if (row) {
      console.log(`Fetched booking with ID ${id} successfully.`);
      // res.json(row);
      const formattedResponse = {
        ...row,
        SLOT: safeParseJSON(row.SLOT) // Ensure SLOT is properly parsed
      };
      res.json(formattedResponse);
    } else {
      res.status(404).json({ message: "Booking not found" });
    }
  });
});

// Create a new booking
router.post("/", (req, res) => {
  const {
    booking_name,
    contact_number,
    alt_contact_number,
    booking_type,
    event_type,
    description,
    slot_day,
    slot_type,
    slot_number,
    number_of_persons,
    menu_id,
    menu_items_ids,
    add_service_ids,
    discount = 0,
    advance = 0,
    total_remaining = 0,
    notes,
    isDrafted = 0,
    status = null,
    SLOT
  } = req.body;

  const total_amount = req.body.total_remaining + req.body.advance;
  const dashboardDate = SLOT ? convertDate(SLOT.date) : null;

  db.run(
    `INSERT INTO bookings 
      (booking_name, contact_number, alt_contact_number, booking_type, event_type, description, date, slot_day, slot_type, slot_number, 
       number_of_persons, menu_id, menu_items_ids, add_service_ids, discount, advance, total_remaining, total_amount, notes, isDrafted, status, SLOT, dashboardDate) 
     VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    [ 
      booking_name || null,
      contact_number || null,
      alt_contact_number || null,
      booking_type,
      event_type,
      description || null,
      slot_day,
      slot_type,
      slot_number,
      number_of_persons,
      menu_id,
      menu_items_ids || null,
      add_service_ids || null,
      discount,
      advance,
      total_remaining,
      total_amount,
      notes || null,
      isDrafted || 0,
      status || null,
      JSON.stringify(SLOT),
      dashboardDate
    ],

    function (err) {
      if (err) {
        console.error("Error creating booking:", err);
        res.status(500).json({ error: err.message });
      } else {
        console.log(`Booking created successfully with ID ${this.lastID}.`);
        res.status(201).json({ id: this.lastID });
      }
    }
  );
});

// Delete a booking
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM bookings WHERE booking_id = ?", [id], function (err) {
    if (err) {
      console.error(`Error deleting booking with ID ${id}:`, err.message);
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ message: "Booking not found" });
    } else {
      console.log(`Booking with ID ${id} deleted successfully.`);
      res.json({ message: "Booking deleted successfully." });
    }
  });
});

// Update a booking
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const {
    booking_name,
    contact_number,
    alt_contact_number,
    booking_type,
    event_type,
    description,
    slot_day,
    slot_type,
    slot_number,
    number_of_persons,
    menu_id,
    menu_items_ids,
    add_service_ids,
    discount = 0,
    advance = 0,
    total_remaining = 0,
    notes,
    isDrafted = 0,
    status = null,
    SLOT
  } = req.body;

  const total_amount = req.body.total_remaining + req.body.advance;
  const dashboardDate = SLOT ? convertDate(SLOT.date) : null;

  db.run(
    `UPDATE bookings SET 
      booking_name = ?, contact_number = ?, alt_contact_number = ?, booking_type = ?, event_type = ?, description = ?, 
      slot_day = ?, slot_type = ?, slot_number = ?, number_of_persons = ?, menu_id = ?, menu_items_ids = ?, add_service_ids = ?, 
      discount = ?, advance = ?, total_remaining = ?, total_amount = ?, notes = ?, isDrafted = ?, status = ?, SLOT = ?, dashboardDate = ? 
     WHERE booking_id = ?`,

    [ 
      booking_name || null,
      contact_number || null,
      alt_contact_number || null,
      booking_type,
      event_type,
      description || null,
      slot_day,
      slot_type,
      slot_number,
      number_of_persons,
      menu_id,
      menu_items_ids || null,
      add_service_ids || null,
      discount,
      advance,
      total_remaining,
      total_amount,
      notes || null,
      isDrafted || 0,
      status || null,
      JSON.stringify(SLOT),
      dashboardDate,
      id
    ],

    function (err) {
      if (err) {
        console.error(`Error updating booking with ID ${id}:`, err.message);
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ message: "Booking not found" });
      } else {
        console.log(`Booking with ID ${id} updated successfully.`);
        res.json({ message: "Booking updated successfully." });
      }
    }
  );
});

// Update booking status
router.put("/status/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run(
    `UPDATE bookings SET status = ? WHERE booking_id = ?`,
    [status, id],
    function (err) {
      if (err) {
        console.error(`Error updating booking status with ID ${id}:`, err.message);
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ message: "Booking not found" });
      } else {
        console.log(`Booking status with ID ${id} updated successfully.`);
        res.json({ message: "Booking status updated successfully." });
      }
    }
  );
});

// Update booking add payment
router.put("/payment/:id", (req, res) => {
  const { id } = req.params;

  console.log("req.body", req.body);

  const { paymentToAdd, account_id } = req.body;

  db.get(`SELECT * FROM bookings WHERE booking_id = ?`, [id], (err, row) => {
    if (err) {
      console.error(`Error fetching booking with ID ${id}:`, err.message);
      return res.status(500).json({ error: err.message });
    } else if (!row) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const total_remaining = row.total_remaining - paymentToAdd;
    let payment_received = row.payment_received ? row.payment_received : 0;
    payment_received += paymentToAdd;

    db.run(
      `UPDATE bookings SET payment_received = ?, total_remaining = ? WHERE booking_id = ?`,
      [payment_received, total_remaining, id],
      function (err) {
        if (err) {
          console.error(`Error updating booking payment with ID ${id}:`, err.message);
          res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
          res.status(404).json({ message: "Booking not found" });
        } else {
          console.log(`Booking payment with ID ${id} updated successfully.`);
        }
      }
    );

    db.get("SELECT balance FROM vendors WHERE vendor_id = ?", [account_id], (err, row) => {
      if (err) {
        console.error("Error fetching vendor balance:", err.message);
        return res.status(500).json({ error: err.message });
      }
  
      let balance = row ? row.balance : 0;
      balance += paymentToAdd;
      let ledgerName = "RPV";
      let amountCredit = paymentToAdd;
      let amountDebit = 0;
      let purch_id = id;
  
      db.run(
        `INSERT INTO ledger (name, purch_id, vendor_id, amountDebit, amountCredit, balance) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [ledgerName, purch_id, account_id, amountDebit || 0, amountCredit || 0, balance],
        function (err) {
          if (err) {
            console.error("Error creating ledger entry:", err.message);
            return res.status(500).json({ error: err.message });
          }
  
          db.run("UPDATE vendors SET balance = ? WHERE vendor_id = ?", [balance, account_id], function (err) {
            if (err) {
              console.error("Error updating vendor balance:", err.message);
            }
          });
  
          res.status(201).json({ id: this.lastID });
        }
      );
    });
    
  });
});

module.exports = router;