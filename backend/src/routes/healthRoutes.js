
const express = require("express");
const router = express.Router();
const pool = require("../config/database");

router.get("/", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      status: "healthy",
      database: "connected",
    });
  } catch (error) {
    const code = error.code || "UNKNOWN";

    console.error("Database health check failed:", {
      message: error.message || code,
      code,
    });

    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
    });
  }
});

module.exports = router;
