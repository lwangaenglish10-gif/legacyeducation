const express = require("express");

const {
  registerUser,
  getMe,
} = require("../controllers/userController");

const { loginUser } = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/me", protect, getMe);

router.get(
  "/admin-test",
  protect,
  authorize("admin"),
  (req, res) => {
    res.json({
      message: "Admin access confirmed",
      user: req.user,
    });
  }
);

module.exports = router;