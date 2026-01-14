const express = require("express");
const router = express.Router();
const ruleController = require("../controllers/ruleController");

const authenticateToken = require("../middleware/authMiddleware");

// Debug Check: Ensure imports are valid before defining routes
if (
  !ruleController.getMatchingRules ||
  !ruleController.getRules ||
  !ruleController.updateRule
) {
  console.error(
    "CRITICAL ERROR: ruleController is missing functions. Check backend/controllers/ruleController.js"
  );
}
if (typeof authenticateToken !== "function") {
  console.error(
    "CRITICAL ERROR: authenticateToken is not a function. Check backend/middleware/authMiddleware.js export."
  );
}

// Public route for checking rules (used by tracking.js)
router.get("/matching", ruleController.getMatchingRules);

// Protected routes (Admin Panel)
router.get("/", authenticateToken, ruleController.getRules);
router.post("/", authenticateToken, ruleController.createRule);
router.put("/:id", authenticateToken, ruleController.updateRule);
router.put("/:id/toggle", authenticateToken, ruleController.toggleRule);
router.delete("/:id", authenticateToken, ruleController.deleteRule);

module.exports = router;
