const express = require("express");
const router = express.Router();
const machineAuth = require("./middleware/machineAuth")

router.use(machineAuth);

// Import individual route files for each table
const hallsRoutes = require("./APIs/halls");
const eventsRoutes = require("./APIs/events");
const slotsRoutes = require("./APIs/slots");
const menusRoutes = require("./APIs/menus");
const menuItemsRoutes = require("./APIs/menuItems");
const menuXItemsRoutes = require("./APIs/menu_x_items");
const additionalServicesRoutes = require("./APIs/additionalService");
const bookingsRoutes = require("./APIs/bookings");
const bookingAdditionalServicesRoutes = require("./APIs/booking_additional_services");
const vendorsRoutes = require("./APIs/vendor");
const unitsRoutes = require("./APIs/units");
const categoryRoutes = require("./APIs/category");
const productRoutes = require("./APIs/products")
const purchaseRoutes = require("./APIs/purchase");
const inventoryRoutes = require("./APIs/inventory");
const ledgerRoutes = require("./APIs/ledger");
const inventoryLedgerRoutes = require("./APIs/inventoryLedger");
const expensesRoutes = require("./APIs/expenses");
const dashboardRoutes = require("./APIs/dashboard");
const AcategoryRoutes = require("./APIs/Acategory");
const AsubcategoryRoutes = require("./APIs/Asubcategory");
const voucherRoutes = require("./APIs/voucher");
const purchaseReturnRoutes = require("./APIs/purchaseReturn");
const transactionRoutes = require("./APIs/transactions");
const usersRoutes = require("./APIs/users");
const reportsRoutes = require("./APIs/reports");
const salaryRoutes = require("./APIs/salary");
const salaryHistoryRoutes = require("./APIs/salaryHistory");
const bookingLedgerRoutes = require("./APIs/bookingLedger");
const settingsRoutes = require("./APIs/settings");
const profitLossRoutes = require("./APIs/profitLoss");

// Define routes for all tables
router.use("/halls", hallsRoutes);
router.use("/events", eventsRoutes);
router.use("/slots", slotsRoutes);
router.use("/menus", menusRoutes);
router.use("/menu-items", menuItemsRoutes);
router.use("/menu-x-items", menuXItemsRoutes);
router.use("/additional-services", additionalServicesRoutes);
router.use("/bookings", bookingsRoutes);
router.use("/bookingledger", bookingLedgerRoutes);
router.use("/booking-additional-services", bookingAdditionalServicesRoutes);
router.use("/vendors", vendorsRoutes);
router.use("/units", unitsRoutes);
router.use("/category", categoryRoutes);
router.use("/products", productRoutes);
router.use("/purchase", purchaseRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/ledger", ledgerRoutes);
router.use("/inventoryLedger", inventoryLedgerRoutes);
router.use("/expenses", expensesRoutes);
router.use("/dash", dashboardRoutes);
router.use("/acategory", AcategoryRoutes);
router.use("/asubcategory", AsubcategoryRoutes);
router.use("/vouchers", voucherRoutes);
router.use("/purchaseReturn", purchaseReturnRoutes);
router.use("/transaction", transactionRoutes);
router.use("/users", usersRoutes);
router.use("/reports", reportsRoutes);
router.use("/salary", salaryRoutes);
router.use("/salaryHistory", salaryHistoryRoutes);
router.use("/settings", settingsRoutes);
router.use("/profitLoss", profitLossRoutes);

module.exports = router;
