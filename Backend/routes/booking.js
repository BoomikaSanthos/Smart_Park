const express = require("express");
const router = express.Router();
const Booking = require("../models/bookingModels");
const Slot = require("../models/slotModel");
const auth = require("../middleware/authMiddleware");

// Create booking with time validation
router.post("/", auth, async (req, res) => {
  try {
    const { slotId, vehicleNumber, startTime, endTime } = req.body;

    if (!slotId || !vehicleNumber || !startTime || !endTime) {
      return res
        .status(400)
        .json({ message: "slotId, vehicleNumber, startTime, endTime required" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: "Invalid time values" });
    }

    if (start >= end) {
      return res
        .status(400)
        .json({ message: "End time must be after start time" });
    }

    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    // Check overlapping bookings for this slot
    const conflict = await Booking.findOne({
      slot: slotId,
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } }, // any overlap
      ],
    });

    if (conflict) {
      return res
        .status(400)
        .json({ message: "Slot already booked for this time range" });
    }

    const booking = new Booking({
      user: req.user.id,
      slot: slotId,
      vehicleNumber,
      startTime: start,
      endTime: end,
    });

    await booking.save();

    // Optional: mark slot unavailable (or leave available for future times)
    slot.isAvailable = false;
    await slot.save();

    res.status(201).json({ message: "Booking created", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
