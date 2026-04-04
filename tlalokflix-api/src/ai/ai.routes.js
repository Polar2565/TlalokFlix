const express = require("express");
const { analyzeUserMood, getHomeGreeting } = require("./ai.controller");

const router = express.Router();

router.post("/analyze-mood", analyzeUserMood);
router.post("/home-greeting", getHomeGreeting);

module.exports = router;
