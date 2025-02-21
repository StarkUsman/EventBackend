const express = require("express");
const bodyParser = require("body-parser");
const initDatabase = require("./models/initSchema");
const cors = require("cors");

// const halls = require("./routes/halls");
const routes = require("./routes");
// Import other route files here

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Enable CORS
app.use(cors());
// Initialize database
initDatabase();

// Routes
// app.use("/halls", halls);
app.use("/", routes);
// Add other route endpoints here

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
