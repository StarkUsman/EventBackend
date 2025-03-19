const express = require("express");
const db = require("../models/database");
const router = express.Router();

router.get("/", async (req, res) => {
  let todayDate = new Date();
  let formattedDate = todayDate.toISOString().split('T')[0];
  let startDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
  let formattedStartDate = startDate.toISOString().split('T')[0];
  let endDate = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0);
  let formattedEndDate = endDate.toISOString().split('T')[0];

  try {
    const total_people_served = await getTotalPeopleServed(formattedDate);
    const people_to_be_served = await getPeopleToBeServed(formattedDate);
    const reservations_this_month = await getReservationsThisMonth(formattedStartDate, formattedEndDate);
    // const total_due_balance = await getTotalDueBalance();
    const pct_people_to_be_served_last_month = await getPctPeopleToBeServedLastMonth(people_to_be_served);
    const pct_total_people_served_last_month = await getPctTotalPeopleServedLastMonth(total_people_served);
    const pct_reservations_last_month = await getPctReservationsLastMonth(reservations_this_month);
    // const pct_total_due_balance_last_month = await getPctTotalDueBalanceLastMonth();

    const total_reservations_completed = await getTotalReservationsCompleted(formattedDate);

    res.json({
      total_people_served,
      pct_total_people_served_last_month,

      people_to_be_served,
      pct_people_to_be_served_last_month,
      
      reservations_this_month,
      pct_reservations_last_month,
      
      total_reservations_completed
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: error.message });
  }
});

// Wrap each query in a Promise
function getTotalPeopleServed(formattedDate) {

  return new Promise((resolve, reject) => {
    db.get(
      "SELECT SUM(number_of_persons) AS total_people_served FROM bookings WHERE dashboardDate < ?",
      [formattedDate],
      (err, row) => {
        if (err) reject(err);
        resolve(row?.total_people_served || 0);
      }
    );
  });
}

function getPeopleToBeServed(formattedDate) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT SUM(number_of_persons) AS people_to_be_served FROM bookings WHERE dashboardDate >= ?",
      [formattedDate],
      (err, row) => {
        if (err) reject(err);
        resolve(row?.people_to_be_served || 0);
      }
    );
  });
}

function getReservationsThisMonth(formattedStartDate, formattedEndDate) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT COUNT(*) AS reservations_this_month FROM bookings where dashboardDate >= ? AND dashboardDate <= ?",
      [formattedStartDate, formattedEndDate],
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
  
function getTotalReservationsCompleted(formattedDate){
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT COUNT(*) AS total_reservations_completed FROM bookings WHERE dashboardDate < ? OR status = 'completed'",
        [formattedDate],
        (err, row) => {
          if (err) reject(err);
          resolve(row?.total_reservations_completed || 0);
        }
      );
    });
  }


module.exports = router;