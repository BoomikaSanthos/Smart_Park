const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Booking = require('../models/bookingModels');
const Payment = require('../models/Payment');
const Slot = require('../models/slotModel');
const auth = require('../middleware/authMiddleware');

const IST = () => new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

// 🚀 NEW PAYMENT RULES (Without changing existing logic structure)
// 1. NO-SHOW or 0mins slot used = ₹5
// 2. Late payment (>1 day after slot usage) = parking + ₹5
// 3. Slot usage: start <= usage <= end
// 4. Parking: 1-15mins = 1 slab = ₹5

// ✅ PRIMARY PAYMENT ENDPOINT (From Payment.jsx)
router.post('/pay/:id', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id: bookingId } = req.params;
    const {
      amount, parkingCharge, penalty, penaltyType, paymentMethod,
      vehicleNumber, slotNumber, slabs, actualDurationMinutes
    } = req.body;

    // 1. Find booking
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking || booking.user.toString() !== req.user.id) {
      throw new Error('Booking not found or unauthorized');
    }

    if (booking.paymentStatus === 'paid') {
      throw new Error('Already paid');
    }

    // 🚀 NEW PAYMENT CALCULATION LOGIC
    const now = new Date();
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);
    const entryTime = booking.actualEntryTime ? new Date(booking.actualEntryTime) : null;
    const exitTime = booking.actualExitTime ? new Date(booking.actualExitTime) : null;

    // Calculate actual slot usage duration (within booking window)
    let slotUsageMinutes = 0;
    if (entryTime && exitTime) {
      slotUsageMinutes = (exitTime - entryTime) / 60000;
    } else if (entryTime && !exitTime) {
      slotUsageMinutes = Math.min((now - entryTime) / 60000, (endTime - startTime) / 60000);
    }

    // RULE 1: NO-SHOW or 0mins slot used = ₹5
    const isNoShow = !entryTime && now > endTime;
    if (isNoShow || slotUsageMinutes === 0) {
      booking.amount = 5;
      booking.parkingCharge = 0;
      booking.penaltyAmount = 5;
      booking.penaltyType = 'no-show';
    }
    // RULE 2: Late payment (>1 day after slot usage)
    else if (exitTime && (now - exitTime) > (24 * 60 * 60 * 1000)) {
      const slabsUsed = Math.ceil(slotUsageMinutes / 15);
      booking.parkingCharge = slabsUsed * 5;
      booking.penaltyAmount = 5;
      booking.penaltyType = 'late-payment';
      booking.amount = booking.parkingCharge + booking.penaltyAmount;
    }
    // RULE 3 & 4: Normal slot usage (within booking window)
    else {
      const slabsUsed = Math.ceil(slotUsageMinutes / 15);
      booking.parkingCharge = slabsUsed * 5;
      booking.penaltyAmount = 0;
      booking.penaltyType = '';
      booking.amount = booking.parkingCharge;
    }

    // Override with frontend data if provided (fallback)
    if (amount > 0) booking.amount = amount;
    if (parkingCharge >= 0) booking.parkingCharge = parkingCharge;
    if (penalty >= 0) booking.penaltyAmount = penalty;
    if (penaltyType) booking.penaltyType = penaltyType;
    if (slabs > 0) booking.slabs = slabs;

    // 2. UPDATE BOOKING
    booking.paymentStatus = 'paid';
    booking.penaltyPaid = true;
    booking.paymentMethod = paymentMethod;
    booking.updatedAt = new Date();

    // 3. CREATE PAYMENT RECORD
    const payment = new Payment({
      bookingId: booking._id,
      amount: booking.amount,
      parkingCharge: booking.parkingCharge,
      penaltyAmount: booking.penaltyAmount,
      penaltyType: booking.penaltyType,
      durationMinutes: slotUsageMinutes,
      slabsUsed: booking.slabs || Math.ceil(slotUsageMinutes / 15),
      status: 'paid',
      method: paymentMethod,
      vehicleNumber: vehicleNumber || booking.vehicleNumber,
      slotNumber: slotNumber || booking.slot?.slotNumber
    });

    await payment.save({ session });
    booking.paymentId = payment._id;

    // 4. Release slot if completed
    if (booking.status === 'completed' || booking.status === 'paid') {
      await Slot.updateOne(
        { _id: booking.slot },
        { $set: { isAvailable: true } },
        { session }
      );
    }

    await booking.save({ session });
    await session.commitTransaction();

    res.json({
      success: true,
      message: `✅ Payment successful! ₹${booking.amount} saved`,
      bookingId: booking._id,
      paymentId: payment._id,
      paymentMethod,
      finalAmount: booking.amount,
      slabsUsed: booking.slabs,
      slotUsageMinutes: Math.round(slotUsageMinutes)
    });

  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// ✅ LIVE FEE PREVIEW (Updated for new rules)
router.get('/preview/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user.id });
    if (!booking) {
      return res.status(400).json({ message: 'Booking not found' });
    }

    const now = new Date();
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);
    const entryTime = booking.actualEntryTime ? new Date(booking.actualEntryTime) : null;
    const exitTime = booking.actualExitTime ? new Date(booking.actualExitTime) : null;

    // Calculate slot usage within booking window
    let slotUsageMinutes = 0;
    if (entryTime && exitTime) {
      slotUsageMinutes = (exitTime - entryTime) / 60000;
    } else if (entryTime && !exitTime) {
      slotUsageMinutes = Math.min((now - entryTime) / 60000, (endTime - startTime) / 60000);
    }

    let parkingCharge = 0;
    let penalty = 0;
    let penaltyType = null;

    // RULE 1: NO-SHOW or 0mins = ₹5
    const isNoShow = !entryTime && now > endTime;
    if (isNoShow || slotUsageMinutes === 0) {
      parkingCharge = 0;
      penalty = 5;
      penaltyType = 'no-show';
    }
    // RULE 2: Late payment (>1 day)
    else if (exitTime && (now - exitTime) > (24 * 60 * 60 * 1000)) {
      const slabs = Math.ceil(slotUsageMinutes / 15);
      parkingCharge = slabs * 5;
      penalty = 5;
      penaltyType = 'late-payment';
    }
    // RULE 3 & 4: Normal usage
    else {
      const slabs = Math.ceil(slotUsageMinutes / 15);
      parkingCharge = slabs * 5;
    }

    const totalDue = parkingCharge + penalty;

    res.json({
      slotUsageMinutes: Math.round(slotUsageMinutes),
      slabs: Math.ceil(slotUsageMinutes / 15),
      parkingCharge,
      penalty,
      penaltyType,
      totalDue,
      istNow: IST(),
      status: booking.status,
      isNoShow
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Keep your existing cancel route unchanged
router.post('/cancel/:id', auth, async (req, res) => {
  // ... your existing cancel logic (unchanged)
});

module.exports = router;