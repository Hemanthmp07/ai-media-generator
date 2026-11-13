const express = require("express");
const router = express.Router();
const { validate } = require("../middleware/validation");
const { asyncHandler } = require("../middleware/errorHandler");
const { generateImage } = require("../controllers/imageController");

router.post("/image", validate("generateImage"), asyncHandler(generateImage));

module.exports = router;

