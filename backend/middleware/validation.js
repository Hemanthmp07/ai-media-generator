const { z } = require("zod");
const { ApiError } = require("./errorHandler");

// Validation schemas
const schemas = {
  generateImage: z.object({
    prompt: z.string().min(1, "Prompt is required").max(4000, "Prompt too long"),
    size: z.enum(["1024x1024", "1792x1024", "1024x1792"]).optional(),
    quality: z.enum(["standard", "hd"]).optional(),
    style: z.enum(["vivid", "natural"]).optional(),
    mode: z.enum(["real", "ai"]).optional(),
  }),
  enhancePrompt: z.object({
    prompt: z.string().min(1, "Prompt is required").max(500, "Prompt too long"),
  }),
  generateVideo: z.object({
    prompt: z.string().min(1, "Prompt is required").max(4000, "Prompt too long"),
    duration: z.number().min(1).max(60).optional(),
    style: z.string().optional(),
    motion: z.string().optional(),
    ratio: z.string().optional(),
  }),
  batchProcess: z.object({
    prompts: z.array(z.string()).min(1).max(10),
  }),
};

// Middleware factory
const validate = (schemaKey) => (req, res, next) => {
  try {
    const schema = schemas[schemaKey];
    if (!schema) {
      throw new ApiError(500, "Schema not found");
    }

    const validated = schema.parse(req.body);
    req.validated = validated;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ApiError(400, "Validation failed", error.errors);
    }
    throw error;
  }
};

module.exports = { validate, schemas };
