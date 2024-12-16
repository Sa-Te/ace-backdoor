// app.js
const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const dotenv = require("dotenv");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Load environment variables
dotenv.config();

// Import Routes
const authRoutes = require("./routes/authRoutes");
const visitorRoutes = require("./routes/visitorRoutes");
const ruleRoutes = require("./routes/ruleRoutes");
const jsSnippetRoutes = require("./routes/jsSnippetRoutes");

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);
// Apply helmet with CSP adjustments
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.socket.io"],
        connectSrc: ["'self'", "ws://localhost:3000", "http://localhost:3000"],
      },
    },
  })
);

app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Initialize socket.io
const io = require("socket.io")(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make io accessible to our router
app.set("socketio", io);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
});
app.use(limiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/rules", ruleRoutes);
app.use("/api/js-snippets", jsSnippetRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Backend is running.");
});

module.exports = { app, server };
