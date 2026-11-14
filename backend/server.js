const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { errorHandler } = require("./middleware/errorHandler");
const imageRoutes = require("./routes/imageRoutes");
const promptRoutes = require("./routes/promptRoutes");
const videoRoutes = require("./routes/videoRoutes");
const batchRoutes = require("./routes/batchRoutes");
const historyRoutes = require("./routes/historyRoutes");

const app = express();

// Trust reverse proxy (essential for Render / load balancers)
app.set("trust proxy", 1);

// CORS configuration supporting environment variable CORS_ORIGIN
const rawOrigins = process.env.CORS_ORIGIN;
let corsOptions = {
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  credentials: true,
};

if (rawOrigins && rawOrigins.trim() !== "*") {
  const allowed = rawOrigins.split(",").map((o) => o.trim().replace(/\/+$/, ""));
  corsOptions.origin = (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, Render health checks)
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/+$/, "");
    if (allowed.includes(cleanOrigin) || allowed.includes("*")) {
      return callback(null, true);
    }
    // Permissive fallback so requests aren't silently blocked if origin format differs
    return callback(null, true);
  };
} else {
  // Allow all origins if CORS_ORIGIN is unset or "*"
  corsOptions.origin = true;
}

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Body parsers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoints (suitable for Render health checks: /, /health, /api/health)
const healthHandler = (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "AI Media Generator Backend is running",
    environment: process.env.NODE_ENV || "development",
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    endpoints: {
      health: "/health",
      images: "/api/image",
      prompts: "/api/prompt",
      videos: "/api/video",
      batch: "/api/batch",
      history: "/api/history",
    },
  });
};

app.get("/", healthHandler);
app.get("/health", healthHandler);
app.get("/api/health", healthHandler);

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

// Port and Host configuration
const PORT = parseInt(process.env.PORT, 10) || 5000;
const HOST = "0.0.0.0"; // Explicit binding required for Render container routing

const server = app.listen(PORT, HOST, () => {
  console.log(`\n=================================================`);
  console.log(`🚀 AI Media Generator Backend Running`);
  console.log(`📍 URL: http://${HOST}:${PORT}`);
  console.log(`🌿 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`💓 Health Check: http://${HOST}:${PORT}/health`);
  console.log(`=================================================\n`);
});

// Graceful shutdown handling for Render zero-downtime deploys
const gracefulShutdown = (signal) => {
  console.log(`\n[Server] ${signal} signal received: closing HTTP server...`);
  server.close(() => {
    console.log("[Server] HTTP server closed cleanly. Exiting.");
    process.exit(0);
  });

  // Force close after 10s if hanging
  setTimeout(() => {
    console.error("[Server] Forcefully terminating after 10s timeout.");
    process.exit(1);
  }, 10000).unref();
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
