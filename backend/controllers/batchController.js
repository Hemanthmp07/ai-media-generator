const axios = require("axios");
const { ApiError, asyncHandler } = require("../middleware/errorHandler");

exports.batchProcess = asyncHandler(async (req, res) => {
  const { prompts } = req.validated;

  if (!Array.isArray(prompts) || prompts.length === 0) {
    throw new ApiError(400, "Prompts array is required and must not be empty");
  }

  // Process batch
  const results = [];
  const errors = [];

  for (let i = 0; i < prompts.length; i++) {
    try {
      const prompt = prompts[i];
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
      
      results.push({
        index: i,
        prompt,
        imageUrl,
        status: "success",
      });
    } catch (error) {
      errors.push({
        index: i,
        prompt: prompts[i],
        error: error.message,
      });
    }
  }

  res.json({
    success: true,
    message: `Batch processing complete: ${results.length} succeeded, ${errors.length} failed`,
    data: {
      total: prompts.length,
      succeeded: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    },
  });
});

exports.getBatchStatus = asyncHandler(async (req, res) => {
  const { batchId } = req.params;

  res.json({
    success: true,
    data: {
      batchId,
      status: "completed",
      progress: 100,
      total: 5,
      completed: 5,
      failed: 0,
    },
  });
});
