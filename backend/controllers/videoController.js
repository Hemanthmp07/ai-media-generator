const { ApiError, asyncHandler } = require("../middleware/errorHandler");

let videoService;
try {
  videoService = require("../services/videoService");
} catch (e) {
  videoService = require("../services/videoservice");
}

exports.generateVideo = asyncHandler(async (req, res) => {
  const { prompt, duration = 30, style = "cinematic", motion = "aerial", ratio = "16:9" } = req.validated || req.body;

  if (!prompt || !prompt.trim()) {
    throw new ApiError(400, "Prompt is required");
  }

  const result = await videoService.generateVideo({
    prompt,
    duration: parseInt(duration) || 30,
    style,
    motion,
    ratio,
  });

  res.json({
    success: true,
    message: "Video processed successfully",
    data: result,
  });
});

exports.searchVideos = asyncHandler(async (req, res) => {
  const query = req.query.q || req.body.query || "";

  if (!query || !query.trim()) {
    throw new ApiError(400, "Search query is required");
  }

  const results = await videoService.searchWebVideoServers(query);

  res.json({
    success: true,
    count: results.length,
    data: results,
  });
});

exports.getVideoStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  res.json({
    success: true,
    data: {
      videoId,
      status: "completed",
      progress: 100,
    },
  });
});

exports.listVideos = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      videos: [],
      total: 0,
    },
  });
});
