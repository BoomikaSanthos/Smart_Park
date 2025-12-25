const express = require("express");
const router = express.Router();
const Slot = require("../models/slotModel");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/admin");

const User = require("../models/User");


router.get("/dashboard", auth, admin, (req, res) => {
  res.json({ message: "Welcome Admin! You have full access." });
});

router.get("/get-users", auth, admin, async (req, res) => {
  try {
    const users = await User.find(); // fetch all users
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
// CREATE SLOT (admin only)
router.post("/create-slot", auth, admin, async (req, res) => {
  try {
    const { slotNumber, isBooked } = req.body;

    if (slotNumber === undefined) {
      return res.status(400).json({ message: "slotNumber is required" });
    }

    const existing = await Slot.findOne({ slotNumber });
    if (existing) {
      return res.status(400).json({ message: "Slot already exists" });
    }

    const slot = new Slot({
      slotNumber: slotNumber.toString(),
      isAvailable: !isBooked
    });

    await slot.save();
    res.status(201).json({ message: "Slot created", slot });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
