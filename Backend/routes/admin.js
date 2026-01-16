const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Slot = require("../models/slotModel");
const User = require("../models/User");
const Booking = require("../models/bookingModels");
const Payment = require("../models/Payment");

const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/admin");

// -------------------------
// 🔥 ADMIN FULL DATA DUMP
// Returns all users, slots, bookings, payments
// -------------------------
router.get("/alldata", auth, admin, async (req, res) => {
  try {
    const [allUsers, allSlots, allBookings, allPayments] = await Promise.all([
      User.find({}).lean(),
      Slot.find({}).lean(),
      Booking.find({}).lean(),
      Payment ? Payment.find({}).lean() : []
    ]);

    res.json({
      users: allUsers,
      slots: allSlots,
      bookings: allBookings,
      payments: allPayments,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Admin /alldata error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// -------------------------
// 🔥 USERS ONLY
// Returns all users
// -------------------------
router.get("/users", auth, admin, async (req, res) => {
  try {
    const allUsers = await User.find({}).lean();
    res.json({
      users: allUsers,
      total: allUsers.length
    });
  } catch (error) {
    console.error("Admin /users error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// -------------------------
// 🔥 BOOKINGS ONLY
// Returns all bookings
// -------------------------
router.get("/bookings", auth, admin, async (req, res) => {
  try {
    const allBookings = await Booking.find({}).lean();
    res.json({
      bookings: allBookings,
      total: allBookings.length
    });
  } catch (error) {
    console.error("Admin /bookings error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// -------------------------
// 🔥 PAYMENTS ONLY
// Returns all payments
// -------------------------
router.get("/payments", auth, admin, async (req, res) => {
  try {
    const allPayments = Payment ? await Payment.find({}).lean() : [];
    res.json({
      payments: allPayments,
      total: allPayments.length
    });
  } catch (error) {
    console.error("Admin /payments error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// -------------------------
// 🔥 SLOTS ONLY
// Returns all slots + total & available counts
// -------------------------
router.get("/slots", auth, admin, async (req, res) => {
  try {
    const allSlots = await Slot.find({}).lean();
    res.json({
      slots: allSlots,
      total: allSlots.length,
      available: allSlots.filter(s => s.isAvailable).length
    });
  } catch (error) {
    console.error("Admin /slots error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// -------------------------
// 🔥 ADMIN DASHBOARD
// Returns raw data + quick stats
// -------------------------
router.get("/dashboard", auth, admin, async (req, res) => {
  try {
    const [allUsers, allSlots, allBookings, allPayments] = await Promise.all([
      User.find({}).lean(),
      Slot.find({}).lean(),
      Booking.find({}).lean(),
      Payment ? Payment.find({}).lean() : []
    ]);

    const stats = {
      totalUsers: allUsers.length,
      totalSlots: allSlots.length,
      totalBookings: allBookings.length,
      totalPayments: allPayments.length,
      occupiedSlots: allSlots.filter(s => !s.isAvailable).length,
      totalRevenue: allPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
    };

    res.json({
      rawData: { allUsers, allSlots, allBookings, allPayments },
      stats
    });
  } catch (error) {
    console.error("Admin /dashboard error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// -------------------------
// 🔥 USER PAYMENT HISTORY
// Returns logged-in user's bookings & payments
// -------------------------
router.get("/history", auth, async (req, res) => {
  try {
    const [userBookings, userPayments] = await Promise.all([
      Booking.find({ user: req.user.id }).lean(),
      Payment ? Payment.find({ user: req.user.id }).lean() : []
    ]);

    res.json({
      bookings: userBookings,
      payments: userPayments
    });
  } catch (error) {
    console.error("User /history error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;