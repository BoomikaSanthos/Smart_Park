const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Booking = require('../models/bookingModels');
const Slot = require('../models/slotModel');
const Payment = require('../models/Payment');  // ✅ Added for payment population
const auth = require('../middleware/authMiddleware');

const IST = () => new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

// ✅ 15-MINUTE SLAB CALCULATOR (Unchanged)
const calc15MinSlabs = (startTime, endTime, ratePer15Min = 5) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end - start;
  const fifteenMinMs = 15 * 60 * 1000;
  const slabs = Math.ceil(durationMs / fifteenMinMs);
  const totalCost = slabs * ratePer15Min;

  return {
    slabs,
    durationMs,
    durationMinutes: Math.ceil(durationMs / 60000),
    totalCost,
    ratePer15Min,
    ratePerHour: ratePer15Min * 4
  };
};

// ✅ 1. PREVIEW + BOOK (UNCHANGED LOGIC - Added new payment fields)
router.post('/preview-and-book', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { slotId, vehicleNumber, startTime, endTime } = req.body;

    // 1. FAST slot fetch
    const slot = await Slot.findById(slotId).session(session).lean();
    if (!slot || !slot.isAvailable) {
      throw new Error('Slot unavailable');
    }

    // 2. 15-MIN SLAB COST
    const costDetails = calc15MinSlabs(startTime, endTime, 5);

    // 3. ATOMIC booking + lock (✅ ADDED NEW PAYMENT FIELDS)
    const booking = new Booking({
      user: req.user.id,
      slot: slotId,
      vehicleNumber: vehicleNumber.toUpperCase(),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      plannedSlabs: costDetails.slabs,
      plannedCost: costDetails.totalCost,

      // ✅ NEW PAYMENT FIELDS (for Payment.jsx sync)
      amount: 0,                    // Will be calculated on checkout
      parkingCharge: 0,
      penaltyAmount: 0,
      penaltyType: null,
      paymentStatus: 'pending',     // ✅ Frontend expects this
      penaltyPaid: false,
      paymentMethod: null,
      paymentId: null,

      status: 'active'
    });
    await booking.save({ session });

    await Slot.updateOne(
      { _id: slotId, isAvailable: true },
      { $set: { isAvailable: false } },
      { session }
    );

    await session.commitTransaction();

    res.json({
      success: true,
      booking: { ...booking.toObject(), slot },
      paymentDetails: {
        ...costDetails,
        startTime: IST(new Date(startTime)),
        endTime: IST(new Date(endTime)),
        message: `Booked! ₹${costDetails.totalCost} (${costDetails.slabs} × 15min slabs)`
      }
    });

  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
});

// ✅ 2. CHECK-IN (Enhanced with payment tracking)
router.put('/checkin/:id', auth, async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user.id });
  if (!booking || booking.status !== 'active')
    return res.status(404).json({ message: 'Booking not found or inactive' });

  booking.actualEntryTime = new Date();
  booking.paymentStatus = 'pending';  // ✅ Reset for payment flow
  await booking.save();
  res.json({ success: true, message: 'Timer started', entryTime: IST() });
});

// ✅ 3. CHECKOUT (Enhanced with slabs calculation)
router.put('/checkout/:id', auth, async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user.id });
  if (!booking || !booking.actualEntryTime)
    return res.status(400).json({ message: 'Checkin first' });

  booking.actualExitTime = new Date();

  // ✅ CALCULATE ACTUAL SLABS USED (for Payment.jsx)
  if (booking.actualEntryTime && booking.actualExitTime) {
    const actualDurationMinutes = (booking.actualExitTime - booking.actualEntryTime) / 60000;
    const actualSlabs = Math.ceil(actualDurationMinutes / 15);
    booking.actualDurationMinutes = Math.round(actualDurationMinutes);
    booking.slabs = actualSlabs;  // ✅ Frontend expects this
  }

  // Initialize payment tracking fields
  booking.amount = booking.slabs ? booking.slabs * 5 : 0;
  booking.parkingCharge = booking.amount;
  booking.paymentStatus = 'pending';  // ✅ Ready for payment

  await booking.save();
  res.json({ success: true, message: 'Timer stopped', exitTime: IST() });
});

// ✅ 4. GET ACTIVE BOOKING (Added payment fields)
router.get('/my-active', auth, async (req, res) => {
  const booking = await Booking.findOne({ user: req.user.id, status: 'active' })
    .populate('slot', 'slotNumber location pricePerHour');
  res.json(booking || { message: 'No active booking' });
});

// ✅ 5. HISTORY (FIXED + Payment.jsx Compatible)
router.get('/history', auth, async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id })
    .populate('slot', 'slotNumber location state')           // ✅ Slot info
    .populate('paymentId', 'amount status method')           // ✅ Payment info
    .sort({ createdAt: -1 })
    .limit(50);

  // ✅ PERFECT MAPPING FOR History.jsx + Payment.jsx
  const mapped = bookings.map(b => {
    const payment = b.paymentId ? b.paymentId.toObject() : null;

    return {
      ...b.toObject(),

      // ✅ Payment data (History.jsx expects these exact fields)
      amount: b.amount || payment?.amount || 0,
      parkingCharge: b.parkingCharge || payment?.parkingCharge || 0,
      penaltyAmount: b.penaltyAmount || payment?.penaltyAmount || 0,
      penaltyType: b.penaltyType || payment?.penaltyType || null,
      paymentStatus: b.paymentStatus || payment?.status || 'pending',
      paymentMethod: b.paymentMethod || payment?.method || null,

      // ✅ Slabs calculation (for Pay button)
      slabs: b.slabs || b.plannedSlabs || Math.ceil((b.actualDurationMinutes || 60) / 15),

      // ✅ Duration (Payment.jsx expects minutes)
      actualDurationMinutes: b.actualDurationMinutes ||
                           (b.actualEntryTime && b.actualExitTime
                             ? Math.round((new Date(b.actualExitTime) - new Date(b.actualEntryTime)) / 60000)
                             : 0)
    };
  });

  res.json({ bookings: mapped, total: mapped.length });
});


module.exports = router;
