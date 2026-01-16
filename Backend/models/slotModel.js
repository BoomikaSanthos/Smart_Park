const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  slotNumber: { type: String, required: true, unique: true },
  state: String,
  location: String,
  slotStatus: String,
  vehicleType: String,
  isAvailable: { type: Boolean, default: true },
  alerts: {
    systemError: { type: Boolean, default: false },
    maintenance: { type: Boolean, default: false },
    infrastructure: { type: Boolean, default: false },
  },
}, { timestamps: true });

module.exports = mongoose.model("Slot", slotSchema);