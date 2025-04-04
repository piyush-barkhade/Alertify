const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password, emergencyContacts } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists. Please log in." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Ensure emergencyContacts is an array
    const formattedContacts = Array.isArray(emergencyContacts)
      ? emergencyContacts
      : [];

    const user = new User({
      name,
      email: email.toLowerCase(), // Normalize email
      password: hashedPassword,
      emergencyContacts: formattedContacts,
      alertsSent: 0, // ✅ New users start with 0 alerts sent
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
};
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

    console.log("✅ Login Success:");
    console.log("Token:", token);
    console.log("User ID:", user._id);
    console.log("Email:", user.email);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emergencyContacts: user.emergencyContacts,
        alertsSent: user.alertsSent, // ✅ Include number of alerts sent
      },
    });
  } catch (error) {
    console.error("❌ Login Error:", error.message);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    // ✅ Fetch user from the database (excluding password)
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("❌ Error fetching user details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Add Emergency Contact (Fixes DB Update Issue)
exports.addContact = async (req, res) => {
  try {
    const { userId, contact } = req.body;

    if (!userId || !contact || !contact.name || !contact.phone) {
      return res
        .status(400)
        .json({ message: "User ID, name, and phone are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Format phone number to E.164
    const phoneNumber = contact.phone.startsWith("+91")
      ? contact.phone
      : `+91${contact.phone.replace(/\D/g, "")}`;

    // Optional: Use Twilio Verify API to register or send verification
    try {
      await client.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({ to: phoneNumber, channel: "sms" });

      console.log(`✅ Verification initiated for ${phoneNumber}`);
    } catch (twilioErr) {
      console.warn(
        `⚠️ Failed to verify ${phoneNumber} on Twilio:`,
        twilioErr.message
      );
    }

    // Save contact in database
    user.emergencyContacts.push({ name: contact.name, phone: phoneNumber });
    await user.save();

    res.status(200).json({
      message: "Contact added successfully and registered on Twilio",
      emergencyContacts: user.emergencyContacts,
    });
  } catch (error) {
    console.error("❌ Add Contact Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Delete Emergency Contact
exports.deleteContact = async (req, res) => {
  try {
    const { userId, contactId } = req.body;

    if (!userId || !contactId) {
      return res
        .status(400)
        .json({ message: "User ID and Contact ID are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove contact by ID
    user.emergencyContacts = user.emergencyContacts.filter(
      (contact) => contact._id.toString() !== contactId
    );

    await user.save();

    res.status(200).json({
      message: "Contact deleted successfully",
      emergencyContacts: user.emergencyContacts,
    });
  } catch (error) {
    console.error("❌ Delete Contact Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
