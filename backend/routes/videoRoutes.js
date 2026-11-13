const express = require("express");
const router = express.Router();
const { validate } = require("../middleware/validation");
const { asyncHandler } = require("../middleware/errorHandler");
const videoController = require("../controllers/videoController");

router.post("/generate", validate("generateVideo"), asyncHandler(videoController.generateVideo));
router.get("/search", asyncHandler(videoController.searchVideos));
router.post("/search", asyncHandler(videoController.searchVideos));
router.get("/status/:videoId", asyncHandler(videoController.getVideoStatus));
router.get("/list", asyncHandler(videoController.listVideos));

module.exports = router;
