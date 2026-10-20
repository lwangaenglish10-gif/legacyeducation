
const express = require("express");
const pool = require("../config/database");

const router = express.Router();

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

// Subscribe to the newsletter
router.post("/", async (req, res) => {
  try {
    const { email, consent } = req.body || {};

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        message: "Please provide your email address.",
      });
    }

    const normalizedEmail = normalizeEmail(email);

    if (
      normalizedEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      return res.status(400).json({
        message: "Please provide a valid email address.",
      });
    }

    if (consent !== true) {
      return res.status(400).json({
        message: "Please agree to receive newsletter updates.",
      });
    }

    const existing = await pool.query(
      `SELECT id, status
       FROM newsletter_subscribers
       WHERE email = $1`,
      [normalizedEmail]
    );

    if (existing.rows.length > 0) {
      if (existing.rows[0].status === "subscribed") {
        return res.status(200).json({
          message: "This email is already subscribed.",
        });
      }

      await pool.query(
        `UPDATE newsletter_subscribers
         SET status = 'subscribed',
             consent_given = TRUE,
             updated_at = NOW()
         WHERE id = $1`,
        [existing.rows[0].id]
      );

      return res.status(200).json({
        message: "Your newsletter subscription has been renewed.",
      });
    }

    await pool.query(
      `INSERT INTO newsletter_subscribers
         (email, consent_given, status)
       VALUES ($1, TRUE, 'subscribed')`,
      [normalizedEmail]
    );

    return res.status(201).json({
      message: "You have successfully subscribed to the newsletter.",
    });
  } catch (error) {
    console.error("Newsletter subscription failed:", error.message);

    return res.status(500).json({
      message: "We couldn't complete your subscription. Please try again.",
    });
  }
});

module.exports = router;
