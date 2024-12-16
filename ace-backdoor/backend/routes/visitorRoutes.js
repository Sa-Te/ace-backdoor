// routes/visitorRoutes.js
const express = require("express");
const router = express.Router();
const {
  trackVisitor,
  getVisitors,
  getUserActivities,
  visitorPing,
} = require("../controllers/visitorController");
const authMiddleware = require("../middleware/authMiddleware");

// Track visitor - no authentication required
router.post("/track", trackVisitor);
router.post("/ping", visitorPing); // New route for heartbeat

// Apply authentication middleware to routes below
router.use(authMiddleware);

// GET /api/visitors - Fetch all visitors (dashboard domain table)
router.get("/", getVisitors);

// GET /api/visitors/user-activities - Fetch latest 50 user activities (user activity table)
router.get("/user-activities", getUserActivities);

module.exports = router;
