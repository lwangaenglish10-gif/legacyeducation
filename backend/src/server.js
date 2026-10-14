
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const healthRoutes = require("./routes/healthRoutes");
const userRoutes = require("./routes/userRoutes");
const contentRoutes = require("./routes/contentRoutes");
const mediaRoutes = require("./routes/mediaRoutes");

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
app.use("/api/media", mediaRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found.",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(err.status || 500).json({
    message: "An unexpected server error occurred.",
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`LegacyEducation API running on port ${PORT}`);
});

server.on("error", (err) => {
  console.error("Server startup error:", err.message);
  process.exitCode = 1;
});
