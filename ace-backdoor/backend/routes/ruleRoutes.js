// routes/ruleRoutes.js

const express = require("express");
const router = express.Router();
const {
  getRules,
  createRule,
  updateRule,
  deleteRule,
  getMatchingRules,
} = require("../controllers/ruleController");
const authMiddleware = require("../middleware/authMiddleware");

// Public route (no auth needed) for the test site to pull
router.get("/matching", getMatchingRules);

// Protect these routes with auth
router.use(authMiddleware);

router.get("/", getRules);
router.post("/", createRule);
router.put("/:id", updateRule);
router.delete("/:id", deleteRule);

module.exports = router;
