const twilio = require("twilio");
const User = require("../models/User.js"); // ✅ Import the User model
require("dotenv").config();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Function to make emergency call
const makeEmergencyCall = async (phoneNumber, userName, location) => {
  try {
    const message = `🚨 Emergency! ${userName} needs help. Location: Latitude ${location.lat}, Longitude ${location.lng}`;
    await client.calls.create({
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
      twiml: `<Response><Say>${message}</Say></Response>`,
    });
    console.log(`✅ Call made to ${phoneNumber}`);
  } catch (error) {
    console.error(`❌ Failed to make call to ${phoneNumber}:`, error.message);
  }
};

// Function to send emergency SMS to all contacts
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
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber,
        });
        console.log(`✅ SMS sent to ${phoneNumber} (${contact.name})`);
      } catch (smsError) {
        console.error(
          `❌ Failed to send SMS to ${phoneNumber}:`,
          smsError.message
        );
      }

      // Place emergency call to the contact
      await makeEmergencyCall(phoneNumber, user.name, location);
    }
  } catch (error) {
    console.error("❌ Error in sendEmergencySMS:", error.message);
  }
};

module.exports = { sendEmergencySMS, makeEmergencyCall };
