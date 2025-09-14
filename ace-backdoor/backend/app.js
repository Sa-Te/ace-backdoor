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

// // Load .env
// require("dotenv").config({ path: "./.env" });

app.set("trust proxy", true);

// Middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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

// Initialize Socket.IO
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: false,
  },
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
const publicPath = "/home/apijquery/ace-backend/dist";
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

// For any other route, serve your React app
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
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");
    // Now that we know the DB is connected, we can do other startup tasks.
    return User.findOne({ where: { username: "admin" } });
  })
  .then((user) => {
    if (!user) {
      const bcrypt = require("bcrypt");
      return bcrypt
        .hash("password123", 10)
        .then((hashedPassword) =>
          User.create({ username: "admin", password: hashedPassword })
        );
    }
  })
  .then(() => {
    // Start background jobs and load non-critical databases
    startCleanupJob();
    loadDatabase()
      .then(() => console.log("GeoIP DB loaded."))
      .catch((err) => console.error("GeoIP Error:", err));
    console.log("Application is ready and initialized.");
  })
  .catch((err) => {
    console.error("CRITICAL ERROR DURING INITIALIZATION:", err);
  });

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

const PORT = process.env.PORT || 3000;

module.exports = app;

if (process.env.NODE_ENV === "production") {
  // Export only the app for Passenger
  module.exports = app;
} else {
  // Local dev mode: run server manually
  server.listen(PORT, () => {
    console.log(`Server running locally on http://localhost:${PORT}`);
  });
}
