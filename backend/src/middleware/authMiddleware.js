const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(401).json({
        message: "Invalid token payload.",
      });
    }

    const result = await pool.query(
      "SELECT id, full_name, email, role FROM users WHERE id = $1",
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "User account not found.",
      });
    }

    // Use the current database role, not the role stored in the token.
    req.user = result.rows[0];

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Invalid or expired token.",
      });
    }

    console.error("Authentication error:", error);

    return res.status(500).json({
      message: "Authentication failed.",
    });
  }
};

module.exports = protect;