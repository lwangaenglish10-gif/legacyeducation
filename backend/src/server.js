
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");

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

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the LegacyEducation API",
    status: "running",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/learning-modules", learningModulesRoutes);
app.use("/api/lessons", lessonsRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((err, req, res, next) => {
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
