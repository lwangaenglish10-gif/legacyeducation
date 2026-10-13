const bcrypt = require("bcrypt");
const pool = require("../config/database");

const registerUser = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    // Validate required fields
    if (!full_name || !email || !password) {
      return res.status(400).json({
        message: "Full name, email and password are required"
      });
    }

    // Check whether the email already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "Email is already registered"
      });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create the user
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, full_name, email, role, created_at`,
      [full_name, email, passwordHash]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0]
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    res.status(500).json({
      message: "Server error while registering user"
    });
  }
};

module.exports = {
  registerUser
};