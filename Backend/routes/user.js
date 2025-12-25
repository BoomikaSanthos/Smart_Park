const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");



router.get("/user-only-route", auth, async (req, res) => {
  try {
    if (req.user.role == "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. user only route." });
    } else {
      return res
        .status(200)
        .json({ message: "welcome user ,user only route." });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
