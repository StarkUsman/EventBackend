const express = require("express");
const router = express.Router();

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

// Define routes for all tables
router.use("/halls", hallsRoutes);
router.use("/events", eventsRoutes);
router.use("/slots", slotsRoutes);
router.use("/menus", menusRoutes);
router.use("/menu-items", menuItemsRoutes);
router.use("/menu-x-items", menuXItemsRoutes);
router.use("/additional-services", additionalServicesRoutes);
router.use("/bookings", bookingsRoutes);
router.use("/booking-additional-services", bookingAdditionalServicesRoutes);

module.exports = router;
