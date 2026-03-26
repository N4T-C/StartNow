const express = require("express");
const { analyzeController, historyController } = require("../controllers/analyzeController");

const router = express.Router();

router.post("/analyze", analyzeController);
router.get("/history", historyController);

module.exports = router;
