const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { errorHandler, asyncHandler } = require("./middleware/errorHandler");
const imageRoutes = require("./routes/imageRoutes");
const promptRoutes = require("./routes/promptRoutes");
const videoRoutes = require("./routes/videoRoutes");
const batchRoutes = require("./routes/batchRoutes");
const historyRoutes = require("./routes/historyRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI Media Generator Backend is running",
    version: "1.0.0",
    endpoints: {
      images: "/api/image",
      prompts: "/api/prompt",
      videos: "/api/video",
      batch: "/api/batch",
      history: "/api/history",
    },
  });
});

// API Routes
app.use("/api", imageRoutes);
app.use("/api/prompt", promptRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/batch", batchRoutes);
app.use("/api/history", historyRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    path: req.path,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n✅ Backend running on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}`);
  console.log(`📚 Health: http://localhost:${PORT}/\n`);
});