const mongoose = require("mongoose");

const AlertSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  timestamp: { type: Date, default: Date.now },
  contactsNotified: { type: Boolean, default: false },
});

module.exports = mongoose.model("Alert", AlertSchema);
