const express = require("express");
const router = express.Router();
const { validate } = require("../middleware/validation");
const { asyncHandler } = require("../middleware/errorHandler");
const { enhancePrompt } = require("../controllers/promptController");

router.post("/enhance", validate("enhancePrompt"), asyncHandler(enhancePrompt));

module.exports = router;