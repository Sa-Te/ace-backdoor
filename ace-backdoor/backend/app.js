// Load .env
require("dotenv").config({ path: "./.env" });

const express = require("express");
const app = express();

const cors = require("cors");
const http = require("http");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const { sequelize, User, Visitor } = require("./models");
const { loadDatabase } = require("./services/geoIPService");

//commented out for deployment in cpanel
// const fs = require("fs");
// const util = require("util");
// const logFile = fs.createWriteStream(__dirname + "/debug.log", { flags: "a" }); // Append mode
// const logStdout = process.stdout;

// console.log = (message, ...optionalParams) => {
//   const formattedMessage = util.format(message, ...optionalParams);
//   logFile.write(`[LOG]: ${formattedMessage}\n`);
//   logStdout.write(`[LOG]: ${formattedMessage}\n`);
// };

// console.error = (message, ...optionalParams) => {
//   const formattedMessage = util.format(message, ...optionalParams);
//   logFile.write(`[ERROR]: ${formattedMessage}\n`);
//   logStdout.write(`[ERROR]: ${formattedMessage}\n`);
// };

app.set("trust proxy", 1);

// Middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    // Universal Allow: Reflect the origin back to the browser
    callback(null, true);
  },
  credentials: true, // Allow cookies/headers
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));

// Apply to Preflight (OPTIONS) requests - THIS WAS THE MISSING LINK
app.options("*", cors(corsOptions));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.socket.io", "https://apijquery.com"],
        connectSrc: ["'self'", "https://apijquery.com", "wss://apijquery.com"],
        imgSrc: ["'self'", "data:", "*"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      },
    },
  })
);

app.use(express.json());

// Create HTTP server
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Always listen on the port cPanel assigns (process.env.PORT)
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Initialize Socket.IO
const io = require("socket.io")(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, true);
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["polling", "websocket"],
  allowEIO3: true,
});

// Socket.IO Connection Handling
io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on("disconnect", (reason) => {
    console.log(`Client disconnected: ${socket.id}, Reason: ${reason}`);
  });

  socket.on("error", (error) => {
    console.error(`Socket error from ${socket.id}:`, error);
  });
});

// Make IO available to controllers
app.set("socketio", io);

//Serve static content
const publicPath = path.join(__dirname, "dist");
app.use(express.static(publicPath));

// Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
});
app.use(limiter);

// Import routes
const authRoutes = require("./routes/authRoutes");
const visitorRoutes = require("./routes/visitorRoutes");
const ruleRoutes = require("./routes/ruleRoutes");
const jsSnippetRoutes = require("./routes/jsSnippetRoutes");

// Assign routes
app.use("/api/visitors", visitorRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/rules", ruleRoutes);
app.use("/api/js-snippets", jsSnippetRoutes);

// React Fallback
app.get("*", (req, res) => {
  if (!req.url.startsWith("/api")) {
    res.sendFile(path.join(publicPath, "index.html"), (err) => {
      if (err) {
        console.error("Error serving index.html:", err);
        res
          .status(500)
          .send("An error occurred while serving the application.");
      }
    });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "Online", port: PORT, env: process.env.NODE_ENV });
});

// Sync DB and start server
// sequelize
//   .sync({ alter: true })
//   .then(async () => {
//     console.log("Database synced.");

//     // Ensure there's an admin user
//     const existingUser = await User.findOne({ where: { username: "admin" } });
//     if (!existingUser) {
//       const hashedPassword = await bcrypt.hash("password123", 10);
//       await User.create({ username: "admin", password: hashedPassword });
//       console.log("Admin user created: username=admin, password=password123");
//     }

//     const PORT = process.env.PORT || 3000;
//     server.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//     });

//     // Start cleanup job
//     startCleanupJob();
//   })
//   .catch((err) => {
//     console.error("Error syncing database:", err);
//   });

// Sync DB and Initialize
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database Connected.");

    // Ensure Admin Exists (Securely)
    const admin = await User.findOne({ where: { username: "admin" } });
    if (!admin) {
      const bcrypt = require("bcrypt");

      const initialPassword =
        process.env.ADMIN_INITIAL_PASSWORD || "ChangeMe123!";
      const hashedPassword = await bcrypt.hash(initialPassword, 10);

      await User.create({ username: "admin", password: hashedPassword });
      console.log("✅ Admin user created.");
    }

    await loadDatabase();
    console.log("✅ GeoIP Database Loaded.");

    startCleanupJob();
  } catch (err) {
    console.error("⚠️ Initialization Error:", err.message);
  }
})();

// Cleanup visitors if inactive
function startCleanupJob() {
  const cleanupInterval = 10000; // every 10 seconds
  const inactivityTimeout = 15000; // 15 seconds inactivity => offline

  setInterval(async () => {
    const cutoffTime = new Date(Date.now() - inactivityTimeout);
    try {
      const [updatedCount] = await Visitor.update(
        { active: false },
        {
          where: {
            active: true,
            lastActive: { [Op.lt]: cutoffTime },
          },
        }
      );
      if (updatedCount > 0) {
        console.log(`Marked ${updatedCount} visitor(s) as inactive.`);
      }
    } catch (error) {
      console.error("Error during cleanup job:", error);
    }
  }, cleanupInterval);
}

// Load MaxMind DB
loadDatabase()
  .then(() => {
    console.log("MaxMind GeoLite2 database loaded successfully.");
  })
  .catch((err) => {
    console.error("Failed to load MaxMind database:", err);
  });

module.exports = app;
