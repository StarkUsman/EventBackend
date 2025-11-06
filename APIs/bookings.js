const express = require("express");
const db = require("../models/database");
const router = express.Router();
const convertDate = require("../utils/dateConverter");

// Get all bookings
router.get("/", (req, res) => {
  db.all("SELECT * FROM bookings ORDER BY booking_id ASC", [], (err, rows) => {
    if (err) {
      console.error("Error fetching bookings:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      const formattedResponse = rows.map((row) => ({
        ...row,
        additional_services: JSON.parse(row.additional_services),
        selectedMenu: JSON.parse(row.selectedMenu),
        SLOT: JSON.parse(row.SLOT),
        date: row.date.split('T')[0],
        user: JSON.parse(row.user)
      }));
      res.json(formattedResponse);
    }
  });
});

router.get("/all", (req, res) => {
  /*
  return array of objects with this structure:
  {
    id: booking_id,
    title: reservation_name,
    start: dashboardDate,
  }
  */
  db.all("SELECT booking_id, reservation_name, dashboardDate, SLOT, status FROM bookings ORDER BY booking_id ASC", [], (err, rows) => {
    if (err) {
      console.error("Error fetching bookings:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      const formattedResponse = rows.map((row) => ({
        id: JSON.stringify(row.booking_id),
        title: row.reservation_name,
        start: row.dashboardDate,
        end: row.dashboardDate,
        time: JSON.parse(row.SLOT).slot,
        status: row.status,
      }));
      res.json({
        data: formattedResponse,
        totalData: formattedResponse.length
      });
    }
  });
});

router.get("/formatted", (req, res) => {
  db.all("SELECT * FROM bookings ORDER BY dashboardDate ASC", [], (err, rows) => {
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
        SLOT: safeParseJSON(row.SLOT),
        date: row.date.split('T')[0],
        user: safeParseJSON(row.user),
        additional_services: safeParseJSON(row.additional_services),
        selectedMenu: safeParseJSON(row.selectedMenu),
      }));

      res.json({
        totalData: formattedResponse.length,
        data: formattedResponse
      });
    }
  });
});

router.get("/month/:month", (req, res) => {
  const { month } = req.params;
  const startDate = new Date(month);
  const endDate = new Date(month);
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(0); // Set to the last day of the month

  db.all(
    "SELECT * FROM bookings WHERE dashboardDate >= ? AND dashboardDate <= ? AND status != 'DRAFTED' ORDER BY dashboardDate ASC",
    [startDate.toISOString(), endDate.toISOString()],
    (err, rows) => {
      if (err) {
        console.error("Error fetching bookings:", err.message);
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

      const formattedResponse = rows.map((row, index) => ({
        sNo: index + 1,
        ...row,
        SLOT: safeParseJSON(row.SLOT),
        date: row.date.split('T')[0],
        user: safeParseJSON(row.user),
        additional_services: safeParseJSON(row.additional_services),
        selectedMenu: safeParseJSON(row.selectedMenu),
      }));

      res.json({
        totalData: formattedResponse.length,
        data: formattedResponse
      });
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
        SLOT: safeParseJSON(row.SLOT),
        user: safeParseJSON(row.user),
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
      // res.json(row);
      const formattedResponse = {
        ...row,
        SLOT: safeParseJSON(row.SLOT), // Ensure SLOT is properly parsed
        user: safeParseJSON(row.user), // Ensure user is properly parsed  
        selectedMenu: safeParseJSON(row.selectedMenu),
        additional_services: safeParseJSON(row.additional_services),
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
    reservation_name,
    contact_number,
    alt_contact_number,
    booking_type,
    description,
    date,
    num_of_persons,
    additional_services,
    selectedMenu,
    booker_type,
    status = null,
    additionalPrice = 0,
    discount = 0,
    notes,
    add_service_ids,
    menu_items_ids,
    total_menu_price,
    grandTotal,
    total_price,
    SLOT,
    advance = 0,
    total_remaining = 0,
    payment_received = 0,
    user
  } = req.body;

  const dashboardDate = SLOT ? convertDate(SLOT[0].date) : null;

  db.run(
    `INSERT INTO bookings 
      (reservation_name, contact_number, alt_contact_number, booking_type, description, date, number_of_persons, 
       additional_services, selectedMenu, booker_type, status, additionalPrice, discount, notes, add_service_ids, 
       menu_items_ids, total_menu_price, grandTotal, total_price, SLOT, advance, total_remaining, 
       payment_received, dashboardDate, user) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    
    [
      reservation_name || null,
      contact_number || null,
      alt_contact_number || null,
      booking_type || null,
      description || null,
      date || null,
      num_of_persons || 0,
      JSON.stringify(additional_services) || "[]",
      JSON.stringify(selectedMenu) || "{}",
      booker_type || null,
      status,
      additionalPrice,
      discount,
      notes || null,
      JSON.stringify(add_service_ids) || "[]",
      JSON.stringify(menu_items_ids) || "[]",
      total_menu_price || 0,
      grandTotal || 0,
      total_price || 0,
      JSON.stringify(SLOT) || "{}",
      advance,
      total_remaining,
      payment_received,
      dashboardDate,
      JSON.stringify(user) || "{}"
    ],

    function (err) {
      if (err) {
        console.error("Error creating booking:", err);
        res.status(500).json({ error: err.message });
      } else {
        let purch_id = this.lastID;
        let response = { id: this.lastID };
        // res.status(201).json({ id: this.lastID });
        let isSoundLedgerEnabled = false;
        let isStageDecoreEnabled = false;
        let soundServicePrice = 0;
        let stageDecoreServicePrice = 0;
        if(req.body.additional_services && req.body.additional_services != []){
          for (let i = 0; i< req.body.additional_services.length; i++){
            if(req.body.additional_services[i].additional_service_name == "Audio System"){
              isSoundLedgerEnabled = true;
              soundServicePrice = req.body.additional_services[i].totalPrice;
            }
            if(req.body.additional_services[i].additional_service_name == "Stage Decor"){
              isStageDecoreEnabled = true;
              stageDecoreServicePrice = req.body.additional_services[i].totalPrice;
            }
          }
        }

        if (isSoundLedgerEnabled){
          db.get("SELECT * FROM vendors WHERE name = ?", ["SOUND"], (err, row) => {
            if (err) {
              console.error("Error fetching vendor balance:", err.message);
              return res.status(500).json({ error: err.message });
            }
            if(!row) {
              console.error("Vendor not found");
            }        
            let balance = row ? row.balance : 0;
            let vendor_id = row.vendor_id;
            balance = balance - soundServicePrice;
            let ledgerName = "RES:"+reservation_name;
            let amountDebit = soundServicePrice;
            let amountCredit = 0;
            
            db.run(
              `INSERT INTO ledger (name, purch_id, vendor_id, amountDebit, amountCredit, balance) 
              VALUES (?, ?, ?, ?, ?, ?)`,
              [ledgerName, purch_id, vendor_id, amountDebit || 0, amountCredit || 0, balance],
              function (err) {
                if (err) {
                  console.error("Error creating ledger entry:", err.message);
                  return res.status(500).json({ error: err.message });
                }
    
                // Now update vendor balance
                db.run("UPDATE vendors SET balance = ? WHERE name = 'SOUND'", [balance], function (err) {
                  if (err) {
                    console.error("Error updating vendor balance:", err.message);
                  }
                });                
              }
            );
          });
        }

        if (isStageDecoreEnabled){
          db.get("SELECT * FROM vendors WHERE name = ?", ["STAGE DECORE"], (err, row) => {
            if (err) {
              console.error("Error fetching vendor balance:", err.message);
              return res.status(500).json({ error: err.message });
            }
            if(!row) {
              console.error("Vendor not found");
            }        
            let balance = row ? row.balance : 0;
            let vendor_id = row.vendor_id;
            balance = balance - stageDecoreServicePrice;
            let ledgerName = "RES:"+reservation_name;
            let amountDebit = stageDecoreServicePrice;
            let amountCredit = 0;
            
            db.run(
              `INSERT INTO ledger (name, purch_id, vendor_id, amountDebit, amountCredit, balance) 
              VALUES (?, ?, ?, ?, ?, ?)`,
              [ledgerName, purch_id, vendor_id, amountDebit || 0, amountCredit || 0, balance],
              function (err) {
                if (err) {
                  console.error("Error creating ledger entry:", err.message);
                  return res.status(500).json({ error: err.message });
                }
    
                // Now update vendor balance
                db.run("UPDATE vendors SET balance = ? WHERE name = 'STAGE DECORE'", [balance], function (err) {
                  if (err) {
                    console.error("Error updating vendor balance:", err.message);
                  }
                });                
              }
            );
          });
        }
        res.status(201).json(response);
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
      res.json({ message: "Booking deleted successfully." });
    }
  });
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const {
    reservation_name,
    contact_number,
    alt_contact_number,
    booking_type,
    description,
    date,
    number_of_persons,
    additional_services,
    selectedMenu,
    booker_type,
    status = null,
    additionalPrice = 0,
    discount = 0,
    notes,
    add_service_ids,
    menu_items_ids,
    total_menu_price,
    grandTotal,
    total_price,
    SLOT,
    advance = 0,
    total_remaining = 0,
  } = req.body;

  const dashboardDate = SLOT ? convertDate(SLOT[0].date) : null;

  db.run(
    `UPDATE bookings SET 
      reservation_name = ?, contact_number = ?, alt_contact_number = ?, booking_type = ?, description = ?, 
      date = ?, number_of_persons = ?, additional_services = ?, selectedMenu = ?, booker_type = ?, status = ?, 
      additionalPrice = ?, discount = ?, notes = ?, add_service_ids = ?, menu_items_ids = ?, total_menu_price = ?, 
      grandTotal = ?, total_price = ?, SLOT = ?, advance = ?, dashboardDate = ?, total_remaining = ?  
     WHERE booking_id = ?`,

    [
      reservation_name || null,
      contact_number || null,
      alt_contact_number || null,
      booking_type || null,
      description || null,
      date || null,
      number_of_persons || 0,
      JSON.stringify(additional_services) || "[]",
      JSON.stringify(selectedMenu) || "{}",
      booker_type || null,
      status,
      additionalPrice,
      discount,
      notes || null,
      JSON.stringify(add_service_ids) || "[]",
      JSON.stringify(menu_items_ids) || "[]",
      total_menu_price || 0,
      grandTotal || 0,
      total_price || 0,
      JSON.stringify(SLOT) || "{}",
      advance,
      dashboardDate,
      total_remaining,
      id
    ],

    function (err) {
      if (err) {
        console.error(`Error updating booking with ID ${id}:`, err.message);
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ message: "Booking not found" });
      } else {
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
        res.json({ message: "Booking status updated successfully." });
      }
    }
  );
});

// Update booking status and free the slot
router.put("/cancel/:id", (req, res) => {
  const { id } = req.params;
  const { status, SLOT } = req.body;

  db.run(
    `UPDATE bookings SET status = ?, SLOT = ? WHERE booking_id = ?`,
    [status, JSON.stringify(SLOT), id],
    function (err) {
      if (err) {
        console.error(`Error updating booking status with ID ${id}:`, err.message);
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ message: "Booking not found" });
      } else {
        res.json({ message: "Booking status updated successfully." });
      }
    }
  );
});

// Update booking add payment
router.put("/payment/:id", (req, res) => {
  const { id } = req.params;

  const { paymentToAdd } = req.body;

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

    const status = total_remaining <= 0 ? "FULLFILLED" : row.status === "FULLFILLED" ? "OPEN" : row.status;

    db.run(
      `UPDATE bookings SET payment_received = ?, total_remaining = ?, status = ? WHERE booking_id = ?`,
      [payment_received, total_remaining, status, id],
      function (err) {
        if (err) {
          console.error(`Error updating booking payment with ID ${id}:`, err.message);
          res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
          res.status(404).json({ message: "Booking not found" });
        } else {
        }
      }
    );
    res.status(201).json({ id: this.lastID });
    
  });
});

module.exports = router;