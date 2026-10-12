const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the LegacyEducation API",
    status: "running"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`LegacyEducation API running on port ${PORT}`);
});