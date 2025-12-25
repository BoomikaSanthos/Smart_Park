// backend/seed/slotSeeder.js
const mongoose = require("mongoose");
const Slot = require("../models/slotModel");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log(err));

const slots = [
  { slotNumber: "A1", isAvailable: true,  state: "TN", location: { x: 10, y: 20 } },
  { slotNumber: "A2", isAvailable: false, state: "TN", location: { x: 20, y: 20 } },
  { slotNumber: "A3", isAvailable: true,  state: "KA", location: { x: 30, y: 20 } },
  { slotNumber: "A4", isAvailable: true,  state: "KA", location: { x: 40, y: 20 } },
];

Slot.insertMany(slots)
  .then(() => {
    console.log("Slots Inserted Successfully!");
    mongoose.connection.close();
  })
  .catch((err) => console.log(err));
