
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const healthRoutes = require("./routes/healthRoutes");
const userRoutes = require("./routes/userRoutes");
const contentRoutes = require("./routes/contentRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Welcome route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the LegacyEducation API",
    status: "running",
  });
});

// API routes
app.use("/api/health", healthRoutes);
app.use("/api/users", userRoutes);
app.use("/api/content", contentRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found.",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  res.status(err.status || 500).json({
    message: "An unexpected server error occurred.",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`LegacyEducation API running on port ${PORT}`);
});
