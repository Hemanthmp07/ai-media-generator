const { ApiError } = require("../middleware/errorHandler");

exports.enhancePrompt = async (req, res, next) => {
  try {
    const { prompt } = req.validated;

    if (!prompt || !prompt.trim()) {
      throw new ApiError(400, "Prompt is required");
    }

    const original = prompt.trim();

    // Enhanced prompt with cinematic and professional quality
    const enhanced =
      `${original}, highly detailed, cinematic composition, ` +
      `professional photography, realistic lighting, sharp focus, ` +
      `rich colors, atmospheric depth, high quality, visually stunning`;

    res.json({
      success: true,
      data: {
        originalPrompt: original,
        enhancedPrompt: enhanced,
        tokens: enhanced.split(" ").length,
      },
    });
  } catch (error) {
    console.error("Prompt enhancement error:", error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Failed to enhance prompt", error.message);
  }
};