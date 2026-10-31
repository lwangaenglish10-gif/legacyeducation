const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const multer = require("multer");
const { createRateLimiter } = require("./middleware/rateLimit");

dotenv.config();

const healthRoutes = require("./routes/healthRoutes");
const usersRoutes = require("./routes/userRoutes");
const contentRoutes = require("./routes/contentRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const learningModulesRoutes = require("./routes/learningModules");
const lessonsRoutes = require("./routes/lessons");
const newsletterRoutes = require("./routes/newsletterRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.disable("x-powered-by");
app.set("trust proxy", 1);

const configuredOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

const allowedOrigins = new Set([
  "https://legacyeducation-frontend.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  ...configuredOrigins,
]);

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin.replace(/\/$/, ""))) {
        return callback(null, true);
      }
      return callback(new Error("CORS origin not allowed."));
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
    maxAge: 86400,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use(morgan("combined"));

const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "Too many requests from this address. Please try again later.",
});

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 12,
  message: "Too many authentication attempts. Please wait and try again.",
});

const registrationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many registration attempts. Please try again later.",
});

const newsletterLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many subscription attempts. Please try again later.",
});

app.use(generalLimiter);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the LegacyEducation API",
    status: "running",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/users/register", registrationLimiter);
app.use("/api/users/login", authLimiter);
app.use("/api/users", usersRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/learning-modules", learningModulesRoutes);
app.use("/api/lessons", lessonsRoutes);
app.use("/api/newsletter", newsletterLimiter, newsletterRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((err, req, res, next) => {
  if (err.message === "CORS origin not allowed.") {
    return res.status(403).json({ message: "Origin not allowed." });
  }

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: "The uploaded file is too large. Maximum size is 25 MB." });
    }

    return res.status(400).json({ message: "The uploaded file could not be processed." });
  }

  if (err.message?.startsWith("Unsupported file type.")) {
    return res.status(400).json({ message: err.message });
  }

  console.error("Server error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    message: "Internal server error.",
  });
});

app.listen(PORT, () => {
  console.log(`LegacyEducation API running on port ${PORT}`);
});
