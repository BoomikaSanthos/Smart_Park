const express = require('express');
const router = express.Router();
const Booking = require('../models/bookingModels');
const Slot = require('../models/slotModel');
const User = require('../models/User');

// ✅ FIX 1: Handle STRING dates from seeder
const parseDate = (dateStr) => {
  if (!dateStr) return new Date('2026-01-01');
  const date = new Date(dateStr);
  return isNaN(date) ? new Date('2026-01-01') : date;
};

// ✅ SIMPLIFIED time filter - WORKS WITH YOUR SEEDER DATA
const getTimeFilter = (timePeriod) => {
  const now = new Date('2026-01-11T15:00:00Z'); // Your current date
  switch (timePeriod) {
    case 'day': return { createdAt: { $gte: new Date(now - 24*60*60*1000) } };
    case 'week': return { createdAt: { $gte: new Date(now - 7*24*60*60*1000) } };
    default: return {}; // ✅ ALL DATA for month (your seeder data)
  }
};

router.get('/custom', async (req, res) => {
  try {
    console.log('🔍 Analytics query:', req.query); // DEBUG

    const { time, type, state, location, slotNumber, userId, username } = req.query;

    // Base match
    let match = getTimeFilter(time);

    // User filter by ID OR USERNAME ✅ NEW USERNAME SUPPORT
    if (type === 'user') {
      if (userId) {
        match.user = userId;
        console.log('👤 Filtering user ID:', userId);
      } else if (username) {
        const userDoc = await User.findOne({ name: username }).select('_id');
        if (userDoc) {
          match.user = userDoc._id;
          console.log('👤 Filtering username:', username);
        } else {
          return res.json({
            totalBookings: 0,
            totalRevenue: 0,
            message: `User "${username}" not found`
          });
        }
      }
    }

    // Slot filters - YOUR REAL DATA STRUCTURE
    if (slotNumber) {
      const slotDoc = await Slot.findOne({ slotNumber });
      if (slotDoc) {
        match.slot = slotDoc._id;
        console.log('🎯 Slot filter:', slotNumber);
      }
    } else if (location) {
      const locationSlots = await Slot.find({ location });
      if (locationSlots.length > 0) {
        match.$or = locationSlots.map(s => ({ slot: s._id }));
        console.log('📍 Location slots:', locationSlots.length);
      }
    } else if (state) {
      const stateSlots = await Slot.find({ state });
      if (stateSlots.length > 0) {
        match.$or = stateSlots.map(s => ({ slot: s._id }));
        console.log('🌍 State slots:', stateSlots.length);
      }
    }

    console.log('🔍 Final match:', JSON.stringify(match, null, 2));

    // ✅ MAIN METRICS - Bulletproof aggregation
    const metrics = await Booking.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [
                { $ne: ['$paymentStatus', 'no-show'] },
                { $ifNull: ['$amount', 20] },
                0
              ]
            }
          },
          activeBookings: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          pendingPayments: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] } },
          completedPayments: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, 1, 0] } },
          avgDuration: { $avg: { $ifNull: ['$actualDurationMinutes', 0] } },
          uniqueUsers: { $addToSet: '$user' }
        }
      },
      {
        $project: {
          totalBookings: { $ifNull: ['$totalBookings', 0] },
          totalRevenue: { $round: [{ $ifNull: ['$totalRevenue', 0] }, 2] },
          activeBookings: { $ifNull: ['$activeBookings', 0] },
          pendingPayments: { $ifNull: ['$pendingPayments', 0] },
          completedPayments: { $ifNull: ['$completedPayments', 0] },
          averageDurationHours: { $round: [{ $divide: [{ $ifNull: ['$avgDuration', 0] }, 60] }, 1] },
          totalUsers: { $size: { $ifNull: ['$uniqueUsers', []] } }
        }
      }
    ]);

    // ✅ PEAK HOURS - Simple & working
    const peakHours = await Booking.aggregate([
      { $match: match },
      { $addFields: { hour: { $hour: { $dateFromString: { dateString: '$createdAt' } } } } },
      { $group: { _id: '$hour', bookings: { $sum: 1 } } },
      { $sort: { bookings: -1 } },
      { $limit: 12 },
      { $project: { hour: '$_id', bookings: 1, _id: 0 } }
    ]);

    // ✅ TOP SLOTS
    const topSlots = await Booking.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'slots',
          localField: 'slot',
          foreignField: '_id',
          as: 'slotInfo'
        }
      },
      { $unwind: { path: '$slotInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$slotInfo.slotNumber',
          slot: { $first: '$slotInfo.slotNumber' },
          location: { $first: '$slotInfo.location' },
          state: { $first: '$slotInfo.state' },
          bookings: { $sum: 1 },
          revenue: { $sum: { $ifNull: ['$amount', 20] } }
        }
      },
      { $sort: { bookings: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, slot: 1, location: 1, state: 1, bookings: 1, revenue: 1 } }
    ]);

    // ✅ NEW: USER ANALYSIS - Top users by bookings & revenue
    const topUsers = await Booking.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$userInfo._id',
          username: { $first: { $ifNull: ['$userInfo.name', 'Unknown'] } },
          email: { $first: { $ifNull: ['$userInfo.email', 'N/A'] } },
          vehicleNumber: { $first: { $ifNull: ['$userInfo.vehicleNumber', 'N/A'] } },
          totalBookings: { $sum: 1 },
          totalSpent: {
            $sum: {
              $cond: [
                { $ne: ['$paymentStatus', 'no-show'] },
                { $ifNull: ['$amount', 20] },
                0
              ]
            }
          },
          avgBookingValue: {
            $avg: {
              $cond: [
                { $ne: ['$paymentStatus', 'no-show'] },
                { $ifNull: ['$amount', 20] },
                null
              ]
            }
          }
        }
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          username: 1,
          email: 1,
          vehicleNumber: 1,
          totalBookings: 1,
          totalSpent: { $round: ['$totalSpent', 2] },
          avgBookingValue: { $round: [{ $ifNull: ['$avgBookingValue', 0] }, 2] }
        }
      }
    ]);

    const result = {
      ...(metrics[0] || { totalBookings: 0, totalRevenue: 0, totalUsers: 0 }),
      peakHours: peakHours.length ? peakHours : [],
      slotUsage: topSlots.length ? topSlots : [],
      topUsers: topUsers.length ? topUsers : [] // ✅ NEW USER ANALYSIS
    };

    console.log('✅ Analytics result:', {
      totalBookings: result.totalBookings,
      slots: topSlots.length,
      topUsers: topUsers.length,
      peakHours: peakHours.length
    });

    res.json(result);
  } catch (error) {
    console.error('❌ Analytics ERROR:', error);
    res.status(500).json({ error: error.message, query: req.query });
  }
});

// ✅ DROPDOWNS - Your existing data
router.get('/states', async (req, res) => {
  try {
    const states = await Slot.distinct('state');
    res.json(states.filter(Boolean));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/locations', async (req, res) => {
  try {
    const { state } = req.query;
    const locations = await Slot.distinct('location', state ? { state } : {});
    res.json(locations.filter(Boolean));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/numbers', async (req, res) => {
  try {
    const { state, location } = req.query;
    const query = {};
    if (state) query.state = state;
    if (location) query.location = location;
    const slots = await Slot.find(query, 'slotNumber');
    res.json(slots.map(s => s.slotNumber));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }, '_id name vehicleNumber email')
      .sort({ name: 1 })
      .limit(50);
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
