// routes/jsSnippetRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllScripts,
  createScript,
  updateScript,
  deleteScript,
  getLatestScript,
  executeScript,
  getLatestScriptContent, // Added this function
} = require("../controllers/jsSnippetController");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes accessible without authentication
router.get("/latest", getLatestScript);
router.get("/latest-script.js", getLatestScriptContent); // New endpoint

// Apply authentication middleware to routes below
router.use(authMiddleware);

// Authenticated routes
router.get("/", getAllScripts);
router.post("/", createScript);
router.put("/:id", updateScript);
router.post("/execute", executeScript);
router.delete("/:id", deleteScript);

module.exports = router;
