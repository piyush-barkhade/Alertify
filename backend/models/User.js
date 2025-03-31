const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  emergencyContacts: [{ name: String, phone: String }],
  alertsSent: { type: Number, default: 0 }, // ✅ Track number of SOS alerts sent
});

module.exports = mongoose.model("User", UserSchema);
