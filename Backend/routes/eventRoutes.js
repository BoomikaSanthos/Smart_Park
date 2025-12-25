const {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  getAdvancedEvents,
} = require("../controller/eventController");
router.get("/advanced-events", getAdvancedEvents);
