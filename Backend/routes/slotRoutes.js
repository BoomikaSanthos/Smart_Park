const express = require("express");
const router = express.Router();
const Slot = require("../models/slotModel");
const Booking = require("../models/bookingModels");


// GET all parking slots
router.get("/all", async (req, res) => {
  try {
    const slots = await Slot.find();
    res.json({ slots });
  } catch (err) {
    res.status(500).json({ message: "Error fetching slots" });
  }
});

// OPTIONAL: slots with real‑time status based on active bookings
router.get("/with-status", async (req, res) => {
  try {
    const now = new Date();

    // all slots from DB
    const slots = await Slot.find();

    // active bookings that overlap with "now"
    const activeBookings = await Booking.find({
      status: "active",
      startTime: { $lte: now },
      endTime: { $gte: now },
    }).select("slot");

    const bookedIds = new Set(activeBookings.map((b) => String(b.slot)));

    const result = slots.map((s) => ({
      _id: s._id,
      slotNumber: s.slotNumber,
      isAvailable: !bookedIds.has(String(s._id)),
      location: s.location,
      imageUrl: s.imageUrl,
    }));

    res.json({ slots: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD multiple parking slots
router.post("/add", async (req, res) => {
  try {
    const slots = req.body; // expecting array of slots

    if (!Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ message: "Slots array is required" });
    }

    const savedSlots = await Slot.insertMany(slots);
    res.status(201).json({
      message: "Slots added successfully",
      slots: savedSlots,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
