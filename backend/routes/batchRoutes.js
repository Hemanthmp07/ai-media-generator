const express = require("express");
const router = express.Router();
const { validate } = require("../middleware/validation");
const batchController = require("../controllers/batchController");

router.post("/process", validate("batchProcess"), batchController.batchProcess);
router.get("/status/:batchId", batchController.getBatchStatus);

module.exports = router;
