const express = require("express");
const db = require("../models/database");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const total_people_served = await getTotalPeopleServed();
    const people_to_be_served = await getPeopleToBeServed();
    const reservations_this_month = await getReservationsThisMonth();
    const total_due_balance = await getTotalDueBalance();
    const pct_people_to_be_served_last_month = await getPctPeopleToBeServedLastMonth(people_to_be_served);
    const pct_total_people_served_last_month = await getPctTotalPeopleServedLastMonth(total_people_served);
    const pct_reservations_last_month = await getPctReservationsLastMonth(reservations_this_month);
    // const pct_total_due_balance_last_month = await getPctTotalDueBalanceLastMonth();

    res.json({
      total_people_served,
      pct_total_people_served_last_month,

      people_to_be_served,
      pct_people_to_be_served_last_month,
      
      reservations_this_month,
      pct_reservations_last_month,
      
      total_due_balance,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: error.message });
  }
});

// Wrap each query in a Promise
function getTotalPeopleServed() {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT SUM(number_of_persons) AS total_people_served FROM bookings WHERE slot_day >= date('now', 'start of month') AND slot_day <= date('now')",
      [],
      (err, row) => {
        if (err) reject(err);
        resolve(row?.total_people_served || 0);
      }
    );
  });
}

function getPeopleToBeServed() {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT SUM(number_of_persons) AS people_to_be_served FROM bookings WHERE slot_day >= date('now')",
      [],
      (err, row) => {
        if (err) reject(err);
        resolve(row?.people_to_be_served || 0);
      }
    );
  });
}

function getReservationsThisMonth() {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT COUNT(*) AS reservations_this_month FROM bookings WHERE slot_day >= date('now', 'start of month')",
      [],
      (err, row) => {
        if (err) reject(err);
        resolve(row?.reservations_this_month || 0);
      }
    );
  });
}

function getTotalDueBalance() {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT SUM(balance) AS total_due_balance FROM vendors",
      [],
      (err, row) => {
        if (err) reject(err);
        resolve(row?.total_due_balance || 0);
      }
    );
  });
}

function getPctTotalPeopleServedLastMonth(total_people_served) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT SUM(number_of_persons) AS total_people_served_last_month 
         FROM bookings 
         WHERE slot_day >= date('now', 'start of month', '-1 month') 
           AND slot_day < date('now', 'start of month')`,
        [],
        (err, row) => {
          if (err) reject(err);
          const lastMonthValue = row?.total_people_served_last_month || 1;
          resolve(((total_people_served ? (total_people_served/lastMonthValue) : 0) -1) * 100);
        }
      );
    });
  }
  
function getPctPeopleToBeServedLastMonth(people_to_be_served) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT SUM(number_of_persons) AS people_to_be_served_last_month 
         FROM bookings 
         WHERE slot_day >= date('now', '-1 month') 
           AND slot_day < date('now', 'start of month')`,
        [],
        (err, row) => {
          if (err) reject(err);
          const lastMonthValue = row?.people_to_be_served_last_month || 1;
          resolve(((people_to_be_served ? ( people_to_be_served / lastMonthValue ) : 0) -1) * 100);
        }
      );
    });
  }
  
function getPctReservationsLastMonth(reservations_this_month) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) AS reservations_last_month 
         FROM bookings 
         WHERE slot_day >= date('now', 'start of month', '-1 month') 
           AND slot_day < date('now', 'start of month')`,
        [],
        (err, row) => {
          if (err) reject(err);
          const lastMonthValue = row?.reservations_last_month || 1;
          resolve(((reservations_this_month ? ( reservations_this_month/lastMonthValue) : 0) - 1) * 100);
        }
      );
    });
  }
  
  // 4. Percentage of total due balance last month (if applicable)
// function getPctTotalDueBalanceLastMonth(total_due_balance) {
//     return new Promise((resolve, reject) => {
//       db.get(
//         `SELECT SUM(balance) AS total_due_balance_last_month 
//          FROM vendors`,
//         [],
//         (err, row) => {
//           if (err) reject(err);
//           const lastMonthValue = row?.total_due_balance_last_month || 0;
//           resolve(total_due_balance ? (lastMonthValue / total_due_balance) * 100 : 0);
//         }
//       );
//     });
//   }


module.exports = router;