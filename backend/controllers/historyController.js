const { AsyncLocalStorage } = require("async_hooks");
const { ApiError, asyncHandler } = require("../middleware/errorHandler");

// In-memory storage (replace with database in production)
const history = {
  images: [],
  videos: [],
  edits: [],
};

exports.saveToHistory = asyncHandler(async (req, res) => {
  const { type, data } = req.body;

  if (!type || !data) {
    throw new ApiError(400, "Type and data are required");
  }

  const entry = {
    id: Date.now().toString(),
    type,
    data,
    timestamp: new Date().toISOString(),
  };

  if (type === "image" && history.images) {
    history.images.unshift(entry);
    history.images = history.images.slice(0, 100); // Keep last 100
  } else if (type === "video" && history.videos) {
    history.videos.unshift(entry);
    history.videos = history.videos.slice(0, 50);
  }

  res.json({
    success: true,
    message: "Added to history",
    data: entry,
  });
});

exports.getHistory = asyncHandler(async (req, res) => {
  const { type = "all", limit = 20 } = req.query;

  let items = [];
  if (type === "all") {
    items = [...history.images, ...history.videos].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
  } else if (type === "image") {
    items = history.images;
  } else if (type === "video") {
    items = history.videos;
  }

  res.json({
    success: true,
    data: {
      type,
      total: items.length,
      items: items.slice(0, parseInt(limit)),
    },
  });
});

exports.deleteHistoryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  history.images = history.images.filter((item) => item.id !== id);
  history.videos = history.videos.filter((item) => item.id !== id);

  res.json({
    success: true,
    message: "Item deleted from history",
  });
});

exports.clearHistory = asyncHandler(async (req, res) => {
  const { type = "all" } = req.body;

  if (type === "all" || type === "image") {
    history.images = [];
  }
  if (type === "all" || type === "video") {
    history.videos = [];
  }

  res.json({
    success: true,
    message: `History cleared for type: ${type}`,
  });
});
