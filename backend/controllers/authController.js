const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const twilio = require("twilio");
require("dotenv").config();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, emergencyContacts } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists. Please log in." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const formattedContacts = Array.isArray(emergencyContacts)
      ? emergencyContacts
      : [];

    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      emergencyContacts: formattedContacts,
      alertsSent: 0,
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found. Please register first." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emergencyContacts: user.emergencyContacts,
        alertsSent: user.alertsSent,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// GET USER
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ADD CONTACT
exports.addContact = async (req, res) => {
  try {
    const { userId, contact } = req.body;

    if (!userId || !contact?.name || !contact?.phone) {
      return res
        .status(400)
        .json({ message: "User ID, name, and phone are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const phoneNumber = contact.phone.startsWith("+91")
      ? contact.phone
      : `+91${contact.phone.replace(/\D/g, "")}`;

    // Send OTP via Twilio
    try {
      await client.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({ to: phoneNumber, channel: "sms" });

      console.log(`✅ OTP sent to ${phoneNumber}`);
    } catch (err) {
      console.warn(`⚠️ Twilio Error:`, err.message);
    }

    const newContact = {
      name: contact.name,
      phone: phoneNumber,
      verified: false, // Flag to verify later
    };

    user.emergencyContacts.push(newContact);
    await user.save();

    res.status(200).json({
      message: "Contact added. Verification code sent via SMS.",
      emergencyContacts: user.emergencyContacts,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Add contact failed", error: error.message });
  }
};

// VERIFY CONTACT
exports.verifyContact = async (req, res) => {
  try {
    const { userId, phone, code } = req.body;

    if (!userId || !phone || !code) {
      return res
        .status(400)
        .json({ message: "User ID, phone, and code required" });
    }

    const phoneNumber = phone.startsWith("+91")
      ? phone
      : `+91${phone.replace(/\D/g, "")}`;

    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: phoneNumber, code });

    if (verificationCheck.status !== "approved") {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const contact = user.emergencyContacts.find((c) => c.phone === phoneNumber);
    if (!contact) return res.status(404).json({ message: "Contact not found" });

    contact.verified = true;
    await user.save();

    res.status(200).json({
      message: "Phone number verified successfully",
      contact,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Verification failed", error: error.message });
  }
};

// DELETE CONTACT
exports.deleteContact = async (req, res) => {
  try {
    const { userId, contactId } = req.body;

    if (!userId || !contactId) {
      return res
        .status(400)
        .json({ message: "User ID and Contact ID are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.emergencyContacts = user.emergencyContacts.filter(
      (contact) => contact._id.toString() !== contactId
    );

    await user.save();

    res.status(200).json({
      message: "Contact deleted successfully",
      emergencyContacts: user.emergencyContacts,
    });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};
