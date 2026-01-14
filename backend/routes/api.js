const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

router.post("/ask", chatController.askQuestion);
router.post("/feedback", chatController.submitFeedback);


module.exports = router;
