const express = require("express");
const router = express.Router();
const {
  getRules,
  createRule,
  updateRule,
  deleteRule,
} = require("../controllers/ruleController");
const authMiddleware = require("../middleware/authMiddleware");

// Apply authentication middleware to all rule routes
router.use(authMiddleware);

// GET /api/rules - Retrieve all rules
router.get("/", getRules);

// POST /api/rules - Create a new rule
router.post("/", createRule);

// PUT /api/rules/:id - Update a rule
router.put("/:id", updateRule);

// DELETE /api/rules/:id - Delete a rule
router.delete("/:id", deleteRule);

module.exports = router;
