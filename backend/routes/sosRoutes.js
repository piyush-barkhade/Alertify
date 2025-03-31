const express = require("express");
const { sendSOS } = require("../controllers/sosController.js");
const authMiddleware = require("../middleware/authMiddleware.js");

const router = express.Router();

router.post("/", authMiddleware, sendSOS); // ✅ Protect the SOS route

module.exports = router;
