const express = require("express");
const router = express.Router();
const Slot = require("../models/slotModel");


// ======================= ADD A SLOT =======================
router.post("/add", async (req, res) => {
  try {
    let { slotNumber, state, location, slotStatus, vehicleType, alerts } = req.body;

    // Default alerts if not provided
    alerts = alerts || { systemError: false, maintenance: false, infrastructure: false };

    // Ensure uppercase for consistency
    state = state?.toUpperCase() || "";
    location = location?.toUpperCase() || "";

    // Default slotStatus
    slotStatus = slotStatus || "available";

    const newSlot = new Slot({
      slotNumber,
      state,
      location,
      slotStatus,
      vehicleType,
      alerts,
      isAvailable: !(alerts.systemError || alerts.maintenance || alerts.infrastructure),
    });

    await newSlot.save();
    res.status(201).json({ message: "Slot added", slot: newSlot });
  } catch (err) {
    console.error("❌ Add Slot Error:", err);
    res.status(400).json({ message: "Error adding slot", error: err.message });
  }
});

// ======================= REMOVE A SLOT =======================
router.delete("/remove/:slotNumber", async (req, res) => {
  try {
    const slot = await Slot.findOneAndDelete({ slotNumber: req.params.slotNumber });
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    res.json({ message: "Slot removed", slot });
  } catch (err) {
    console.error("❌ Remove Slot Error:", err);
    res.status(500).json({ message: "Error removing slot" });
  }
});

// ======================= UPDATE / MANAGE A SLOT =======================
router.put("/manage/:slotNumber", async (req, res) => {
  try {
    let { state, location, slotStatus, vehicleType, alerts } = req.body;

    // Ensure uppercase
    state = state?.toUpperCase();
    location = location?.toUpperCase();

    // Safe alerts handling
    alerts = alerts || { systemError: false, maintenance: false, infrastructure: false };

    const updatedSlot = await Slot.findOneAndUpdate(
      { slotNumber: req.params.slotNumber },
      {
        state,
        location,
        slotStatus,
        vehicleType,
        alerts,
        isAvailable: !(alerts.systemError || alerts.maintenance || alerts.infrastructure),
      },
      { new: true, runValidators: true }
    );

    if (!updatedSlot) return res.status(404).json({ message: "Slot not found" });

    res.json({ message: "Slot updated", slot: updatedSlot });
  } catch (err) {
    console.error("❌ Update Slot Error:", err);
    res.status(500).json({ message: "Error updating slot", error: err.message });
  }
});

// ======================= GET SLOTS WITH STATUS =======================
router.get("/with-status", async (req, res) => {
  try {
    const { state, location } = req.query;
    const query = {};

    if (state) query.state = state.toUpperCase();
    if (location) query.location = location.toUpperCase();

    const slots = await Slot.find(query)
      .select("slotNumber isAvailable location state vehicleType slotStatus alerts createdAt")
      .lean()
      .sort({ slotNumber: 1 });

    const availableCount = slots.filter(s => s.isAvailable).length;

    res.json({
      slots,
      stats: { total: slots.length, available: availableCount },
    });
  } catch (err) {
    console.error("❌ Get Slots with Status Error:", err);
    res.status(500).json({ message: "Failed to fetch slots", error: err.message });
  }
});

// ======================= GET ALL SLOTS =======================
router.get("/all", async (req, res) => {
  try {
    const slots = await Slot.find({})
      .select("slotNumber state location slotStatus vehicleType alerts isAvailable")
      .lean()
      .sort({ slotNumber: 1 });

    res.json({ slots });
  } catch (err) {
    console.error("❌ Get All Slots Error:", err);
    res.status(500).json({ message: "Failed to fetch slots", error: err.message });
  }
});

// ======================= GET DISTINCT STATES =======================
router.get("/states", async (req, res) => {
  try {
    const states = await Slot.distinct("state");
    res.json(states);
  } catch (err) {
    console.error("❌ Get States Error:", err);
    res.status(500).json({ message: "Failed to fetch states", error: err.message });
  }
});

// ======================= GET LOCATIONS BY STATE =======================
router.get("/locations", async (req, res) => {
  try {
    const { state } = req.query;
    if (!state) return res.status(400).json({ message: "State is required" });

    const locations = await Slot.distinct("location", { state });
    res.json(locations);
  } catch (err) {
    console.error("❌ Get Locations Error:", err);
    res.status(500).json({ message: "Failed to fetch locations", error: err.message });
  }
});

// ======================= GET SLOTS BY STATE + LOCATION =======================
router.get("/numbers", async (req, res) => {
  try {
    const { state, location } = req.query;
    if (!state || !location)
      return res.status(400).json({ message: "State and Location are required" });

    const slotNumbers = await Slot.distinct("slotNumber", { state, location });
    res.json(slotNumbers);
  } catch (err) {
    console.error("❌ Get Slot Numbers Error:", err);
    res.status(500).json({ message: "Failed to fetch slot numbers", error: err.message });
  }
});

module.exports = router;
