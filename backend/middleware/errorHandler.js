// Global error handling middleware
class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      success: false,
      error: err.message,
      details: err.details,
    });
  }

  // Validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      details: err.message,
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { ApiError, errorHandler, asyncHandler };
