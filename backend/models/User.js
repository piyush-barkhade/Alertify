const mongoose = require("mongoose");

const emergencyContactSchema = new mongoose.Schema({
  name: String,
  phone: String,
  verified: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    emergencyContacts: [emergencyContactSchema],
    alertsSent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
