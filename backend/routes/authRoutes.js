const express = require("express");
const {
  register,
  login,
  getUserDetails,
  addContact,
} = require("../controllers/authController.js");
const authMiddleware = require("../middleware/authMiddleware.js");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getUserDetails);
router.post("/add-contact", authMiddleware, addContact);

module.exports = router;
