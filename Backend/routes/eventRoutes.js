const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

// Middleware
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/admin");

// ✅ GET events (search + sort + pagination)
router.get("/events", async (req, res) => {
  try {
    let { page, limit, search, sort } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 5;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.eventName = { $regex: search, $options: "i" };
    }

    let sortOption = {};
    if (sort === "asc") {
      sortOption.createdAt = 1;
    } else {
      sortOption.createdAt = -1;
    }

    const events = await Event.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      events,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ CREATE event (Admin only)
router.post("/events", auth, admin, async (req, res) => {
  try {
    const { eventName, description, date } = req.body;

    if (!eventName) {
      return res.status(400).json({ message: "Event name is required" });
    }

    const event = new Event({
      eventName,
      description,
      date: date ? new Date(date) : undefined
    });

    await event.save();
    res.status(201).json({
      message: "✅ Event created successfully",
      event
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ UPDATE event (Admin only)
router.put("/events/:id", auth, admin, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({
      message: "✅ Event updated successfully",
      event
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ DELETE event (Admin only)
router.delete("/events/:id", auth, admin, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ message: "✅ Event deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ GET single event
router.get("/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json({ event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;