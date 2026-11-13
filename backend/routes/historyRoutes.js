const express = require("express");
const router = express.Router();
const historyController = require("../controllers/historyController");

router.post("/save", historyController.saveToHistory);
router.get("/", historyController.getHistory);
router.delete("/:id", historyController.deleteHistoryItem);
router.post("/clear", historyController.clearHistory);

module.exports = router;
