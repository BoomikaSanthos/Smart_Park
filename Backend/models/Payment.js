const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema({
  // ✅ Core Links (unchanged)
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true
  },

  // ✅ Payment Amounts (Exact match with Payment.jsx)
  amount: {
    type: Number,
    required: true,
    min: 0
  },        // ✅ 25 (final amount)

  parkingCharge: {
    type: Number,
    required: true,
    min: 0
  },        // ✅ 20

  penaltyAmount: {
    type: Number,
    default: 0,
    min: 0
  },        // ✅ 5

  penaltyType: {
    type: String,
    enum: ['no-show', 'late-payment', ''],
    default: ''
  },        // ✅ "late-payment"

  // ✅ CHANGED: durationMinutes (Payment.jsx sends minutes, not hours)
  durationMinutes: {
    type: Number,
    required: true,
    min: 0
  },        // ✅ 45 mins (from Payment.jsx)

  slabsUsed: {
    type: Number,
    required: true,
    min: 0
  },        // ✅ 3 slabs

  // ✅ Payment details (expanded for Payment.jsx)
  status: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },

  method: {
    type: String,
    enum: ['card', 'upi', 'wallet'],
    required: true
  },

  // ✅ Vehicle & Slot (from Payment.jsx)
  vehicleNumber: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },

  slotNumber: {
    type: String,
    required: true,
    trim: true
  },

  // ✅ User reference (for queries)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }

}, {
  timestamps: true
});

// ✅ Indexes for fast queries
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ user: 1, status: 1, createdAt: -1 });
paymentSchema.index({ vehicleNumber: 1, slotNumber: 1 });

module.exports = mongoose.model('Payment', paymentSchema);