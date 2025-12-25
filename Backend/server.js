const express = require("express");
const app = express();

require("dotenv").config();
const port = process.env.PORT;
const cors = require("cors");
app.use(cors({ origin: "http://localhost:3000" }));
//app.use(cors());
app.use(express.json());

const slotRoutes = require("./routes/slotRoutes");

app.use("/api/slots", slotRoutes);
app.use("/api/admin", require("./routes/admin"));
const companyRoutes = require("./routes/company");
const userRoutes = require("./routes/user");
app.use("/api/company", companyRoutes);
app.use("/api/user", userRoutes);

const authRoutes = require("./routes/auth");

app.use("/api/auth", authRoutes);
// app.use("/api/admin", authRoutes);

const bookingRoutes = require("./routes/booking");
app.use("/api/bookings", bookingRoutes);



const mongoose = require("mongoose");

app.get("/", (req, res) => {
  res.send("Server running successfully");
});
app.get("/description", (req, res) => {
  res.send("Hello world");
});
app.get("/status", (req, res) => {
  res.send("Development status");
});

const users = [
  { email: "test@gmail.com", password: "1234", role: "user" },
  { email: "admin@gmail.com", password: "admin", role: "admin" },
];

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.json({ message: "Invalid credentials" });
  }

  res.json({ message: "Login successful", role: user.role });
});

// Replace 'your_connection_string' with your actual MongoDB URL
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
