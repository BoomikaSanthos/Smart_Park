const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// ----------------------------
// SCHEMAS
// ----------------------------
const SlotSchema = new mongoose.Schema({
  slotNumber: String,
  isAvailable: { type: Boolean, default: true },
  location: String,
  state: String,
  vehicleType: String,
  status: String
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  vehicleNumber: String,
  vehicleType: String,
  phone: String,
  role: { type: String, default: "user" },
  userType: { type: String, enum: ["regular", "high_activity", "cross_state", "flaker"], default: "regular" }
});

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  slot: { type: mongoose.Schema.Types.ObjectId, ref: "Slot" },
  vehicleNumber: String,
  startTime: String,
  endTime: String,
  bookedDurationHours: Number,
  actualEntryTime: String,
  actualExitTime: String,
  actualDurationMinutes: Number,
  status: String,
  paymentStatus: String,
  createdAt: String,
  updatedAt: String,
  bookingType: String,
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" }
});

const PaymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  slotId: String,
  userId: String,
  vehicle: String,
  startTime: String,
  endTime: String,
  bookedDurationHours: Number,
  actualDurationMinutes: Number,
  payment: {
    amount: Number,
    status: String,
    method: String,
    createdAt: String,
    updatedAt: String
  },
  billingDetails: {
    slabsUsed: Number,
    bookedAmount: Number,
    noShowPenalty: Number,
    parkingCharge: Number,
    finalAmount: Number
  }
});

// ----------------------------
// MODELS
// ----------------------------
const Slot = mongoose.models.Slot || mongoose.model("Slot", SlotSchema);
const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Booking = mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
const Payment = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

// ----------------------------
// SEEDER
// ----------------------------
async function runSeeder() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🚀 SEEDER FIXED - 1:1 Booking:Payment Sync");

    const nowIST = new Date("2026-01-07T05:06:00Z");
    const formatIST = (date) => date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata", month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true, timeZoneName: 'short'
    }).replace(' IST', ' (IST)');

    // ----------------------------
    // CLEANUP
    // ----------------------------
    await Slot.updateMany({}, { $unset: { vehicleType: "", status: "" }, $set: { isAvailable: true } });
    await User.deleteMany({});
    await Booking.deleteMany({});
    await Payment.deleteMany({});

    // ----------------------------
    // SLOTS SETUP
    // ----------------------------
    const slots = await Slot.find({});
    console.log(`📊 Processing ${slots.length} slots - ALL FREE`);

    const vehicleTypes = ["car", "bike", "scooter", "van", "bus"];
    const vehicleWeights = [0.50, 0.20, 0.20, 0.10, 0.20];

    for (let slot of slots) {
      const rand = Math.random();
      let cumulative = 0;
      for (let i = 0; i < vehicleTypes.length; i++) {
        cumulative += vehicleWeights[i];
        if (rand <= cumulative / 1.2) {
          slot.vehicleType = vehicleTypes[i];
          break;
        }
      }
      slot.status = "available";
      await slot.save(); // safer than bulkSave
    }
    console.log(`✅ All ${slots.length} slots FREE\n`);

    // ----------------------------
    // USERS
    // ----------------------------
    const savedUsers = [];
    const highActivityUserIds = [];
    const flakerUserIds = [];

    // VIP users
    const vipUsers = [
      { name: "VIP Rajesh", email: "vip1@eliteparking.com", vehicle: "DL01VIP100", phone: "99991111" },
      { name: "Elite Priya", email: "vip2@eliteparking.com", vehicle: "DL01VIP211", phone: "99992222" }
    ];
    for (let user of vipUsers) {
      const saved = await new User({
        name: user.name, email: user.email,
        password: await bcrypt.hash("vip123", 10),
        vehicleNumber: user.vehicle, vehicleType: "Car",
        phone: user.phone, userType: "high_activity"
      }).save();
      savedUsers.push(saved);
      highActivityUserIds.push(saved._id);
    }

    // Flaker users
    const flakerUsers = [
      { name: "NoShow Anil", email: "flaker1@noshow.com", vehicle: "MH01NS200", phone: "88882222" },
      { name: "Cancel Karan", email: "flaker2@noshow.com", vehicle: "MH01NS311", phone: "88883333" }
    ];
    for (let user of flakerUsers) {
      const saved = await new User({
        name: user.name, email: user.email,
        password: await bcrypt.hash("flake123", 10),
        vehicleNumber: user.vehicle, vehicleType: "Bike",
        phone: user.phone, userType: "flaker"
      }).save();
      savedUsers.push(saved);
      flakerUserIds.push(saved._id);
    }

    // Regular users
    const statePlates = { TN: 'TN01', KA: 'KA01', MH: 'MH01', DL: 'DL01', KL: 'KL01' };
    for (let i = 0; i < 50; i++) {
      const states = Object.keys(statePlates);
      const state = states[Math.floor(Math.random() * states.length)];
      const saved = await new User({
        name: `User${400+i}`, email: `user${400+i}@${state.toLowerCase()}.com`,
        password: await bcrypt.hash("user123", 10),
        vehicleNumber: `${statePlates[state]}AB${i}`,
        vehicleType: ["Car", "Bike", "Scooter", "Van", "Bus"][Math.floor(Math.random()*5)],
        phone: `94${40000 + i*100}`
      }).save();
      savedUsers.push(saved);
    }
    console.log(`✅ ${savedUsers.length} users created\n`);

    // ----------------------------
    // UNIVERSAL BOOKING + PAYMENT FUNCTION
    // ----------------------------
    const createCompleteBookingAndPayment = async (slot, userDoc, type) => {
      const bookedDurationHours = Math.floor(Math.random() * 3) + 1;
      let startOffset;
      let actualDurationMinutes = 0;
      let paymentStatus;

      if (type === "past") {
        startOffset = Math.floor(Math.random() * -3 * 24 * 60 * 60 * 1000);
        const isFlaker = flakerUserIds.includes(userDoc._id);
        const paymentRoll = Math.random();
        paymentStatus = paymentRoll < 0.75 ? "completed" :
                       paymentRoll < 0.90 ? "pending" : "no-show";
        if (paymentStatus !== "no-show") {
          actualDurationMinutes = bookedDurationHours * 60 * (Math.random() * 0.8 + 0.2);
        }
      } else if (type === "current") {
        startOffset = Math.random() * 48 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000;
        paymentStatus = "pending";
        actualDurationMinutes = bookedDurationHours * 60 * 0.7;
      } else {
        startOffset = Math.floor(Math.random() * 5 * 24 * 60 * 60 * 1000);
        paymentStatus = "pending";
        actualDurationMinutes = 0;
      }

      const bookedStartTime = new Date(nowIST.getTime() + startOffset);
      const bookedEndTime = new Date(bookedStartTime.getTime() + bookedDurationHours * 60 * 60 * 1000);

      const actualEntryTime = actualDurationMinutes > 0 ?
        new Date(bookedStartTime.getTime() + Math.random() * 10 * 60 * 1000) : null;
      const actualExitTime = actualDurationMinutes > 0 ?
        new Date(actualEntryTime.getTime() + actualDurationMinutes * 60 * 1000) : null;

      const slabsUsed = Math.ceil(actualDurationMinutes / 15);
      const RATE_PER_15MIN = 5;
      const bookedAmount = bookedDurationHours * 20;
      const parkingCharge = slabsUsed * RATE_PER_15MIN;
      let finalAmount = parkingCharge;
      let noShowPenalty = 0;

      if (paymentStatus === "no-show") {
        noShowPenalty = bookedAmount * 0.5;
        finalAmount = noShowPenalty;
      }

      // Occupy slot
      slot.isAvailable = false;
      slot.status = type === "past" ? "booked_past" :
                   type === "current" ? "currently_occupied" : "booked_future";
      await slot.save();

      // Booking
      const booking = new Booking({
        user: userDoc._id,
        slot: slot._id,
        vehicleNumber: userDoc.vehicleNumber,
        startTime: formatIST(bookedStartTime),
        endTime: formatIST(bookedEndTime),
        bookedDurationHours,
        actualEntryTime: actualEntryTime ? formatIST(actualEntryTime) : null,
        actualExitTime: actualExitTime ? formatIST(actualExitTime) : null,
        actualDurationMinutes,
        status: type === "future" ? "confirmed" :
                paymentStatus === "no-show" ? "no-show" : "completed",
        paymentStatus,
        createdAt: formatIST(new Date(nowIST.getTime() - Math.random() * 24 * 60 * 60 * 1000)),
        updatedAt: formatIST(nowIST),
        bookingType: type
      });
      const savedBooking = await booking.save();

      // Payment
      const payment = new Payment({
        bookingId: savedBooking._id,
        slotId: slot.slotNumber,
        userId: userDoc._id.toString(),
        vehicle: userDoc.vehicleType.toLowerCase(),
        startTime: booking.startTime,
        endTime: booking.endTime,
        bookedDurationHours,
        actualDurationMinutes,
        payment: {
          amount: Math.round(finalAmount),
          status: paymentStatus,
          method: ["UPI", "card", "wallet"][Math.floor(Math.random() * 3)],
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt
        },
        billingDetails: {
          slabsUsed, bookedAmount, noShowPenalty, parkingCharge,
          finalAmount: Math.round(finalAmount)
        }
      });
      const savedPayment = await payment.save();

      savedBooking.paymentId = savedPayment._id;
      await savedBooking.save();

      if (type === "past") {
        slot.isAvailable = true;
        slot.status = "available";
        await slot.save();
        console.log(`✅ PAST ${paymentStatus.padEnd(10)} | Slot ${slot.slotNumber} FREED | ₹${Math.round(finalAmount)} | User: ${userDoc.name}`);
      } else {
        console.log(`🔒 ${type.toUpperCase()} ${paymentStatus.padEnd(10)} | Slot ${slot.slotNumber} OCCUPIED | ₹${Math.round(finalAmount)} | User: ${userDoc.name}`);
      }

      return { booking: savedBooking, payment: savedPayment };
    };

    // ----------------------------
    // GENERATE BOOKINGS + PAYMENTS
    // ----------------------------
    console.log("🎫 Creating ALL bookings + payments...\n");

    let bookingCount = 0;
    let paymentCount = 0;

    // Past bookings (150)
    console.log("📅 PAST BOOKINGS (slots freed after checkout)...");
    for (let i = 0; i < 150; i++) {
      const slot = slots[Math.floor(Math.random() * slots.length)];
      const user = savedUsers[bookingCount++ % savedUsers.length];
      await createCompleteBookingAndPayment(slot, user, "past");
      paymentCount++;
    }

    // Current bookings (15% occupancy)
    console.log("\n🔄 CURRENT BOOKINGS (slots occupied)...");
    for (let i = 0; i < Math.floor(slots.length * 0.15); i++) {
      const availableSlots = slots.filter(s => s.isAvailable);
      if (availableSlots.length === 0) break;
      const slot = availableSlots[Math.floor(Math.random() * availableSlots.length)];
      const user = savedUsers[bookingCount++ % savedUsers.length];
      await createCompleteBookingAndPayment(slot, user, "current");
      paymentCount++;
    }

    // Future bookings (10% occupancy)
    console.log("\n⏳ FUTURE BOOKINGS (slots reserved)...");
    for (let i = 0; i < Math.floor(slots.length * 0.10); i++) {
      const availableSlots = slots.filter(s => s.isAvailable);
      if (availableSlots.length === 0) break;
      const slot = availableSlots[Math.floor(Math.random() * availableSlots.length)];
      const user = savedUsers[bookingCount++ % savedUsers.length];
      await createCompleteBookingAndPayment(slot, user, "future");
      paymentCount++;
    }

    // VIP high activity (25 each)
    console.log("\n👑 VIP HIGH ACTIVITY BOOKINGS...");
    for (const userId of highActivityUserIds) {
      const vipUser = savedUsers.find(u => u._id.equals(userId));
      for (let j = 0; j < 25; j++) {
        const availableSlots = slots.filter(s => s.isAvailable);
        if (availableSlots.length === 0) break;
        const slot = availableSlots[Math.floor(Math.random() * availableSlots.length)];
        const type = ["past", "current", "future"][Math.floor(Math.random() * 3)];
        await createCompleteBookingAndPayment(slot, vipUser, type);
        paymentCount++;
      }
    }

    // ----------------------------
    // FINAL STATS
    // ----------------------------
    const finalSlots = await Slot.find({});
    const freeSlots = finalSlots.filter(s => s.isAvailable).length;
    const occupiedSlots = finalSlots.length - freeSlots;

    console.log(`\n🎉 SEEDER COMPLETE!`);
    console.log(`✅ ${bookingCount} BOOKINGS = ${paymentCount} PAYMENTS (100% SYNC)`);
    console.log(`✅ ${freeSlots} FREE slots (${((freeSlots/finalSlots.length)*100).toFixed(0)}%)`);
    console.log(`✅ ${occupiedSlots} OCCUPIED slots (${((occupiedSlots/finalSlots.length)*100).toFixed(0)}%)`);
    console.log(`✅ ${savedUsers.length} users with complete payment history`);
    console.log(`✅ Ready for user payment dashboards! 🚀`);

  } catch (error) {
    console.error("❌ Seeder failed:", error);
  } finally {
    await mongoose.connection.close();
  }
}

runSeeder();
