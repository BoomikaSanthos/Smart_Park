const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");

// ----------------------------
// ✅ India Timezone
// ----------------------------
process.env.TZ = "Asia/Kolkata";

// ----------------------------
// ✅ Port
// ----------------------------
const port = process.env.PORT || 5000;

// ----------------------------
// ✅ CORS
// ----------------------------
app.use(
  cors({
    origin: ["http://localhost:3000","https://smart-park-1-zd3d.onrender.com"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "x-auth-token"],
  })
);

// ----------------------------
// ✅ Body Parsers
// ----------------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ----------------------------
// ✅ Health Check
// ----------------------------
app.get("/", (req, res) => {
  res.json({
    message: "Smart Parking Backend ✅",
    istNow: new Date().toLocaleString("en-IN"),
    endpoints: [
      "/api/auth",
      "/api/admin",
      "/api/slots",
      "/api/bookings",
      "/api/payments",
      "/api/events",
      "/api/company",
      "/api/user",
      "/api/analytics",
    ],
  });
});

// ----------------------------
// ✅ API Routes (LOAD ONCE ONLY)
// ----------------------------
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/slots", require("./routes/slotRoutes"));
app.use("/api/bookings", require("./routes/booking"));
app.use("/api/payments", require("./routes/payment"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/company", require("./routes/company"));
app.use("/api/user", require("./routes/user"));
app.use("/api/analytics", require("./routes/analytics"));

// ----------------------------
// ✅ 404 Handler
// ----------------------------
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ----------------------------
// ✅ MongoDB Connection
// ----------------------------
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("✅ MongoDB Connected (IST)");
    console.log("🕐 Server IST:", new Date().toLocaleString("en-IN"));
  })
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  });

// ----------------------------
// ✅ Penalty Job - Late Payment
// ----------------------------
const Booking = require("./models/bookingModels");

const applyLatePaymentPenalties = async () => {
  try {
    const now = new Date();

    const overdueBookings = await Booking.find({
      paymentStatus: { $ne: "completed" },
      actualExitTime: {
        $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      },
    });

    for (const booking of overdueBookings) {
      if (!booking.penaltyAmount || booking.penaltyAmount === 0) {
        booking.penaltyAmount = 50;
        booking.paymentStatus = "pending_with_penalty";
        booking.penaltyType = "late-payment";
        booking.penaltyAppliedAt = now;
        booking.penaltyPaid = false;
        await booking.save();
      }
    }

    if (overdueBookings.length > 0) {
      console.log(
        `[Penalty Job] Applied penalties to ${overdueBookings.length} bookings`
      );
    }
  } catch (err) {
    console.error("[Penalty Job] Error:", err.message);
  }
};

// Run once on startup
applyLatePaymentPenalties();

// Run every hour
setInterval(applyLatePaymentPenalties, 60 * 60 * 1000);

// ----------------------------
// ✅ Start Server
// ----------------------------
app.listen(port, () => {
  console.log(`🚀 Server running IST on port ${port}`);
  console.log(`🕐 Started: ${new Date().toLocaleString("en-IN")}`);
});
