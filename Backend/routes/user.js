const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Booking = require("../models/bookingModels"); // make sure path is correct
const User = require("../models/User");
const Payment = require("../models/Payment");

// routes/user.js
const Slot = require('../models/slotModel');

// Helper to parse IST date strings
const parseISTDate = (str) => {
  if (!str) return null;
  const cleanStr = str.replace("(IST)", "").trim();
  return new Date(cleanStr);
};

// GET logged-in user's bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const bookings = await Booking.find({ user: userId })
      .populate('slot')       // populate slot info
      .populate('paymentId'); // populate payment info

    // Convert IST strings to JS Date
    const formattedBookings = bookings.map(b => ({
      _id: b._id,
      vehicleNumber: b.vehicleNumber,
      slotNumber: b.slot?.slotNumber || "N/A",
      location: b.slot?.location || "N/A",
      state: b.slot?.state || "N/A",
      startTime: parseISTDate(b.startTime),
      endTime: parseISTDate(b.endTime),
      bookedDurationHours: b.bookedDurationHours,
      actualDurationMinutes: b.actualDurationMinutes,
      status: b.status,
      paymentStatus: b.paymentStatus,
      paymentAmount: b.paymentId?.payment?.amount || 0,
      paymentMethod: b.paymentId?.payment?.method || "N/A",
      bookingType: b.bookingType || "current",
    }));

    res.json({ bookings: formattedBookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// GET /api/users/all
router.get("/all", async (req, res) => {
  try {
    const users = await User.find({}).select("name email").lean();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
});
// GET /api/user/profile
// Fetch logged-in user data

router.get("/profile", auth, async (req, res) => {
  try {
    // req.user.id is set by authMiddleware
    const user = await User.findById(req.user.id).select("-password").lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user
    });
  } catch (err) {
    console.error("Fetch user error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// 1️⃣ GET user-only route (existing)
router.get("/user-only-route", auth, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. user only route." });
    } else {
      return res
        .status(200)
        .json({ message: "welcome user, user only route." });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 2️⃣ GET /api/users/profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// 3️⃣ GET /api/users/stats
router.get("/stats", auth, async (req, res) => {
  try {
    const stats = await Booking.aggregate([
      { $match: { user: req.user.id } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalSpent: { $sum: "$amount" },
          avgDuration: { $avg: "$actualDurationMinutes" },
          activeSessions: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
        },
      },
    ]);
    res.json(
      stats[0] || {
        totalBookings: 0,
        totalSpent: 0,
        avgDuration: 0,
        activeSessions: 0,
      }
    );
  } catch (err) {
    res.status(500).json({ msg: "Stats error" });
  }
});
router.get('/profile-dashboard', auth, async (req, res) => {
  try {
    // Fetch user profile
    const user = await User.findById(req.user.id).select('-password').lean();

    // User bookings with slot details
    const bookings = await Booking.find({ user: req.user.id })
      .populate('slot', 'slotNumber location')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // User payments (if Payment model populated)
    const payments = await Payment.find({ bookingId: { $in: bookings.map(b => b._id) } })
      .sort({ createdAt: -1 })
      .lean();

    // Stats aggregation (monthly spends, bookings trend)
    const stats = await Booking.aggregate([
      { $match: { user: req.user.id } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalSpent: { $sum: '$amount' },
          avgDuration: { $avg: '$actualDurationMinutes' },
          monthlySpends: {
            $push: {
              month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
              spend: '$amount'
            }
          }
        }
      }
    ]);
    const userStats = stats[0] || { totalBookings: 0, totalSpent: 0, avgDuration: 0, monthlySpends: [] };

    res.json({
      user,
      bookings,
      payments,
      stats: userStats
    });
  } catch (err) {
    res.status(500).json({ msg: 'Dashboard error' });
  }
});

// 4️⃣ ✅ NEW ROUTE: GET /api/users/bookings
// Returns **all bookings of logged-in user**
router.get("/bookings", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("slot") // optional, if you want slot details
      .sort({ createdAt: -1 }); // newest first

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching bookings" });
  }
});

module.exports = router;