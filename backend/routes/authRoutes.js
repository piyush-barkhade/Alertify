const express = require("express");
const {
  register,
  login,
  getUserDetails,
  addContact,
  deleteContact,
} = require("../controllers/authController.js");
const authMiddleware = require("../middleware/authMiddleware.js");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getUserDetails);
router.post("/add-contact", authMiddleware, addContact);
router.post("/delete-contact", authMiddleware, deleteContact);

module.exports = router;
