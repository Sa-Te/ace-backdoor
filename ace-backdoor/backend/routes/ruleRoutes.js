// routes/ruleRoutes.js

const express = require("express");
const router = express.Router();
const {
  getRules,
  createRule,
  updateRule,
  deleteRule,
} = require("../controllers/ruleController");
const authMiddleware = require("../middleware/authMiddleware");

// Protect these routes with auth
router.use(authMiddleware);

router.get("/", getRules);
router.post("/", createRule);
router.put("/:id", updateRule);
router.delete("/:id", deleteRule);

module.exports = router;
