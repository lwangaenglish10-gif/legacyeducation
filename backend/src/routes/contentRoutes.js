
const express = require("express");

const {
  create,
  listPublished,
  getOne,
  update,
  remove,
} = require("../controllers/contentController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes: published content only
router.get("/", listPublished);
router.get("/:id", getOne);

// Protected routes: a logged-in user must create content
router.post("/", protect, create);

// Protected routes: the author or an administrator may modify content
router.patch("/:id", protect, update);
router.delete("/:id", protect, remove);

module.exports = router;
