const twilio = require("twilio");
const User = require("../models/User.js");
require("dotenv").config();

// ✅ Ensure Twilio credentials are loaded
const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

if (!TWILIO_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
  console.error("❌ Missing Twilio configuration");
  process.exit(1);
}

const client = new twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

const sendEmergencySMS = async (userId, location) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error("❌ User not found");
      return;
    }

    if (!user.emergencyContacts || user.emergencyContacts.length === 0) {
      console.warn("⚠️ No emergency contacts available for", user.name);
      return;
    }

    const messageBody = `🚨 Emergency! ${user.name} needs help! 📍Location: https://maps.google.com/?q=${location.lat},${location.lng}`;

    // ✅ Send SMS to all emergency contacts
    for (const contact of user.emergencyContacts) {
      if (!contact.phone) {
        console.warn(`⚠️ Contact ${contact.name} has no valid phone number.`);
        continue;
      }

      // Ensure phone number is in E.164 format
      const phoneNumber = contact.phone.startsWith("+91")
        ? contact.phone
        : `+91${contact.phone.replace(/\D/g, "")}`;

      try {
        await client.messages.create({
          body: messageBody,
          from: TWILIO_PHONE_NUMBER,
          to: phoneNumber,
        });
        console.log(`✅ SMS sent to ${phoneNumber} (${contact.name})`);
      } catch (smsError) {
        console.error(
          `❌ Failed to send SMS to ${phoneNumber}:`,
          smsError.message
        );
      }
    }
  } catch (error) {
    console.error("❌ Error in sendEmergencySMS:", error.message);
  }
};

module.exports = sendEmergencySMS;
