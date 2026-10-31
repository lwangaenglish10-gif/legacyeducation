const express = require("express");
const path = require("path");
const fs = require("fs");

const {
  create,
  listPublished,
  listAllForAdmin,
  getOne,
  update,
  remove,
  uploadFile,
  downloadPdf,
} = require("../controllers/mediaController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const optionalAuth = require("../middleware/optionalAuthMiddleware");
const upload = require("../config/upload");

const router = express.Router();
const uploadDirectory = path.resolve(__dirname, "../../uploads");

router.get("/files/:filename", (req, res, next) => {
  const { filename } = req.params;
  const allowedFilename =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|gif|mp4|webm|mp3|wav|ogg|pdf|txt|doc|docx|ppt|pptx)$/i;

  if (!allowedFilename.test(filename)) {
    return res.status(400).json({ message: "Invalid file name." });
  }

  const filePath = path.join(uploadDirectory, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found." });
  }

  res.sendFile(filePath, (err) => {
    if (err && !res.headersSent) next(err);
  });
});

// Public routes.
router.get("/:id/download", optionalAuth, downloadPdf);
router.get("/", listPublished);
router.get("/admin/library", protect, authorize("admin"), listAllForAdmin);
router.get("/:id", optionalAuth, getOne);

// Only administrators or trusted teachers may create/upload learning media.
// Publication remains restricted inside the controller to administrators.
router.post("/", protect, authorize("admin", "teacher"), create);
router.post(
  "/upload",
  protect,
  authorize("admin", "teacher"),
  upload.single("file"),
  uploadFile
);

router.patch("/:id", protect, update);
router.delete("/:id", protect, remove);

module.exports = router;
