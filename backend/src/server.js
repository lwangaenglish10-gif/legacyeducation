const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const healthRoutes = require("./routes/healthRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the LegacyEducation API",
    status: "running"
  });
});

app.use("/api/health", healthRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`LegacyEducation API running on port ${PORT}`);
});