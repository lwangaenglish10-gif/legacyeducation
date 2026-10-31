const multer = require("multer");

const allowedTypes = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "audio/mpeg": ".mp3",
  "audio/wav": ".wav",
  "audio/ogg": ".ogg",
  "application/pdf": ".pdf",
  "text/plain": ".txt",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.ms-powerpoint": ".ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
};

const fileFilter = (req, file, callback) => {
  if (!allowedTypes[file.mimetype]) {
    return callback(
      new Error(
        "Unsupported file type. Upload an approved image, video, audio, or document."
      )
    );
  }

  callback(null, true);
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024,
    files: 1,
  },
});

module.exports = upload;
