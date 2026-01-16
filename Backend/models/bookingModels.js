const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // ✅ Core Booking Fields (unchanged)
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  slot: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true },
  vehicleNumber: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  actualEntryTime: Date,
  actualExitTime: Date,
  actualDurationMinutes: {
    type: Number,
    default: 0,
    min: 0
  },

  // ✅ PAYMENT FIELDS (Enhanced for Payment.jsx)
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },

  amount: {
    type: Number,
    default: 0,
    min: 0
  }, // ✅ Final amount (25 = parking 20 + penalty 5)

  parkingCharge: {
    type: Number,
    default: 0,
    min: 0
  }, // ✅ slabs * 5

  penaltyAmount: {
    type: Number,
    default: 0,
    min: 0
  }, // ✅ 5 (no-show/late)

  penaltyType: {
    type: String,
    enum: ['no-show', 'late-payment', null, ''],
    default: null
  }, // ✅ From payment routes

  penaltyPaid: {
    type: Boolean,
    default: false
  },

  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'wallet', null],
    default: null
  },

  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }, // ✅ Links to Payment record

  // ✅ SLABS TRACKING (Payment.jsx expects this)
  slabs: {
    type: Number,
    default: 0,
    min: 0
  }, // ✅ Actual slabs used (ceil(minutes/15))

  // ✅ BOOKING STATUS (unchanged)
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'paid'],
    default: 'active'
  },

  // ✅ PLANNED COST FIELDS (your existing - unchanged)
  plannedSlabs: Number,
  plannedCost: Number,

  // ✅ PENALTY TRACKING (your existing)
  penaltyAppliedAt: Date

}, {
  timestamps: true
});

// ✅ Virtuals (keep your existing logic)
bookingSchema.virtual('durationHours').get(function() {
  if (this.status !== 'completed' || !this.endTime) return 0;
  return (this.endTime - this.startTime) / (1000 * 60 * 60);
});

bookingSchema.virtual('totalFee').get(function() {
  const hours = this.durationHours;
  return hours <= 2 ? 20 : 20 + Math.floor((hours - 2) * 10);
});

// ✅ JSON Output (unchanged)
bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

// ✅ Indexes for fast queries
bookingSchema.index({ user: 1, status: 1, createdAt: -1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ slot: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
