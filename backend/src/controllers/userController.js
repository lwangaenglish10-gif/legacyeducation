const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const normalizeEmail = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const registerUser = async (req, res) => {
  try {
    const { full_name, password } = req.body;
    const email = normalizeEmail(req.body.email);

    if (
      typeof full_name !== "string" ||
      !full_name.trim() ||
      full_name.trim().length > 120 ||
      !email ||
      email.length > 254 ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 128
    ) {
      return res.status(400).json({
        message:
          "Provide a valid name, email, and a password between 8 and 128 characters.",
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = LOWER($1)",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, full_name, email, role, created_at`,
      [full_name.trim(), email, passwordHash]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      user,
      token,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    console.error("Registration error:", error.message);

    res.status(500).json({
      message: "Server error while registering user",
    });
  }
};

const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, role, created_at
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Get profile error:", error.message);

    res.status(500).json({
      message: "Server error while fetching profile",
    });
  }
};

module.exports = {
  registerUser,
  getMe,
};
