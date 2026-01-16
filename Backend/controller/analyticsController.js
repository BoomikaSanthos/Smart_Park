
const Booking = require("../models/bookingModels");
const Payment = require("../models/Payment");
const Slot = require("../models/slotModel");
const User = require("../models/User");

// Helper to parse your IST date strings into Date objects
const parseISTDate = (str) => {
  if (!str) return null;
  // Remove "(IST)" and parse
  const cleanStr = str.replace("(IST)", "").trim();
  return new Date(cleanStr);
};

// Helper to filter by time (day/week/month)
const getTimeFilter = (time) => {
  const now = new Date();
  let start;
  switch (time) {
    case "day":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "week":
      const day = now.getDay();
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
      break;
    case "month":
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }
  return { start, end: now };
};

exports.getAnalytics = async (req, res) => {
  try {
    const { state, location, slotNumber, time } = req.query;

    // ------------------ Fetch Bookings ------------------
    const bookings = await Booking.find()
      .populate("slot")      // populate slot info
      .populate("user")      // populate user info
      .populate("paymentId"); // populate payment info

    // ------------------ Filter Bookings ------------------
    let filtered = bookings.filter((b) => {
      const slot = b.slot;
      const bookingStart = parseISTDate(b.startTime);

      // state filter
      if (state && (!slot || slot.state !== state)) return false;
      // location filter
      if (location && (!slot || slot.location !== location)) return false;
      // slotNumber filter
      if (slotNumber && (!slot || slot.slotNumber !== slotNumber)) return false;

      // time filter
      if (time) {
        const { start, end } = getTimeFilter(time);
        if (!bookingStart || bookingStart < start || bookingStart > end) return false;
      }

      return true;
    });

    // ------------------ Metrics ------------------
    const totalBookings = filtered.length;

    // Average booked duration hours
    const avgDuration =
      totalBookings > 0
        ? filtered.reduce((sum, b) => sum + (b.bookedDurationHours || 0), 0) / totalBookings
        : 0;

    // Peak hour calculation
    const hoursMap = {};
    filtered.forEach((b) => {
      const h = parseISTDate(b.startTime).getHours();
      hoursMap[h] = (hoursMap[h] || 0) + 1;
    });
    const peakHour =
      Object.keys(hoursMap).length > 0
        ? parseInt(
            Object.entries(hoursMap).reduce((a, b) => (b[1] > a[1] ? b : a))[0]
          )
        : 0;

    // Total revenue from payments
    let totalRevenue = 0;
    filtered.forEach((b) => {
      if (b.paymentId && b.paymentId.payment && b.paymentId.payment.amount) {
        totalRevenue += b.paymentId.payment.amount;
      }
    });

    // Active users
    const userIds = new Set(filtered.map((b) => b.user?._id.toString()));
    const totalUsers = await User.countDocuments();
    const activeUsersCount = userIds.size;

    return res.json({
      totalBookings,
      averageDurationHours: avgDuration.toFixed(2),
      peakHour,
      totalRevenue,
      activeUsersCount,
      totalUsers,
      bookings: filtered, // optional: for chart plotting
    });
  } catch (err) {
    console.error("Analytics fetch error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
