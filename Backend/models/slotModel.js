const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  slotNumber: { type: String, required: true, unique: true },
  isAvailable: { type: Boolean, default: true },
  location: {
    x: Number,
    y: Number,
  },
  // add this
  latitude: { type: Number },
  longitude: { type: Number },

  imageUrl: { type: String },
    // NEW: state code for filtering (e.g., "TN", "KA")
  state: { type: String },

});

module.exports = mongoose.model("Slot", slotSchema);
