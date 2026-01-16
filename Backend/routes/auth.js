const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Booking = require("../models/bookingModels");

const router = express.Router();

// ⚡ SMTP Transport
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// OTP generator
const generateOTP = () => crypto.randomInt(100000, 999999).toString();


// ----------------- VALIDATE (🔥 MISSING FIX) -----------------
router.post("/validate", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    return res.json({ message: "Valid credentials" });

  } catch (err) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
});


// ----------------- REGISTER -----------------
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, vehicleNumber, vehicleType, phone, role, otp, resendOtp } = req.body;

    if (!email || !password || !vehicleNumber || !vehicleType || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email }).lean();
    if (existingUser && !resendOtp && !otp) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (role === "admin") {
      if (!otp) {
        const hashedPassword = await bcrypt.hash(password, 8);
        const otpCode = generateOTP();

        const newUser = new User({
          name,
          email,
          password: hashedPassword,
          vehicleNumber,
          vehicleType,
          phone,
          role,
          otp: otpCode,
          otpExpires: new Date(Date.now() + 10 * 60 * 1000)
        });

        await newUser.save();

        transporter.sendMail({
          to: email,
          subject: "ParkSmart Admin OTP",
          text: `Your OTP: ${otpCode}`
        });

        return res.json({ otpRequired: true });
      }

      const admin = await User.findOne({ email });
      if (!admin || admin.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      await User.findByIdAndUpdate(admin._id, { otp: null, otpExpires: null });
      return res.json({ message: "Admin registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 8);
    await new User({ name, email, password: hashedPassword, vehicleNumber, vehicleType, phone, role }).save();

    res.status(201).json({ message: "User registered" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ----------------- LOGIN -----------------
router.post("/login", async (req, res) => {
  try {
    const { email, password, role, otp } = req.body;

    const user = await User.findOne({ email, role });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Access denied for this role" });
    }

    if (role === "admin") {
      if (!otp) {
        const otpCode = generateOTP();
        await User.findByIdAndUpdate(user._id, {
          otp: otpCode,
          otpExpires: new Date(Date.now() + 10 * 60 * 1000)
        });

        transporter.sendMail({
          to: email,
          subject: "ParkSmart Admin OTP",
          text: `Your OTP: ${otpCode}`
        });

        return res.json({ otpRequired: true });
      }

      if (user.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, role: user.role });

  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});


// ----------------- PROTECTED ROUTES -----------------
const authMiddleware = require("../middleware/authMiddleware");

router.get("/profile", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json({ user });
});

router.get("/my-bookings", authMiddleware, async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id }).populate("slot");
  res.json({ bookings });
});

module.exports = router;
