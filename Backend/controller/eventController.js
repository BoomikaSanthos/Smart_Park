const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/admin");
const eventController = require("../controllers/eventController");

// GET events
router.get("/", eventController.getAdvancedEvents);

// CREATE event (admin only)
router.post("/", auth, admin, eventController.createEvent);

// UPDATE event
router.put("/:id", auth, admin, eventController.updateEvent);

// DELETE event
router.delete("/:id", auth, admin, eventController.deleteEvent);

// GET single event
router.get("/:id", eventController.getSingleEvent);

module.exports = router;
