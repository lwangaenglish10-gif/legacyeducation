const express = require("express");

const {
  create,
  listPublished,
  getOne,
  update,
  remove,
  listMySubmissions,
  listForAdminReview,
} = require("../controllers/contentController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Public route: published content only
router.get("/", listPublished);

// Protected routes must come before /:id
router.get("/my-submissions", protect, listMySubmissions);
router.get("/admin/review", protect, listForAdminReview);

// Existing individual content route
router.get("/:id", getOne);

// Authenticated content operations
router.post("/", protect, create);
router.patch("/:id", protect, update);
router.delete("/:id", protect, remove);

module.exports = router;