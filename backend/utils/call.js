const twilio = require("twilio");
require("dotenv").config();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

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

module.exports = makeEmergencyCall;
