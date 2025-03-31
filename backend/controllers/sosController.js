const Alert = require("../models/Alert.js");
const User = require("../models/User.js");
const sendEmergencySMS = require("../utils/twilio.js");

exports.sendSOS = async (req, res) => {
  try {
    const { userId, location } = req.body;

    if (!userId || !location) {
      return res.status(400).json({ message: "Missing user ID or location." });
    }

    // ✅ Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // ✅ Save the alert
    const alert = new Alert({
      user: userId,
      location,
      contactsNotified: false,
    });
    await alert.save();

    // ✅ Send emergency SMS
    await sendEmergencySMS(userId, location);

    // ✅ Increment the alertsSent count
    user.alertsSent += 1;
    await user.save();

    res.json({ message: "🚨 SOS Alert Sent!", alertsSent: user.alertsSent });
  } catch (error) {
    console.error("Error sending SOS:", error);
    res.status(500).json({ message: "Failed to send SOS alert." });
  }
};
