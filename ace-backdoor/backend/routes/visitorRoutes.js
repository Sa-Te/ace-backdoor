// routes/visitorRoutes.js

const express = require("express");
const router = express.Router();
const {
  trackVisitor,
  getDashboardStats,
  getUserActivities,
  visitorPing,
} = require("../controllers/visitorController");

// ---------------------
// PUBLIC endpoints (no auth):
// ---------------------
router.post("/track", trackVisitor);
router.post("/ping", visitorPing);

// ---------------------
// PROTECTED endpoints (require auth):
// ---------------------
const authMiddleware = require("../middleware/authMiddleware");
router.use(authMiddleware);

//router.get("/", getVisitors);
router.get("/dashboard-stats", getDashboardStats);
router.get("/user-activities", getUserActivities);

module.exports = router;
