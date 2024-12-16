const { app, server } = require("./app");
const { sequelize, User, Visitor } = require("./models");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize"); // Import Sequelize operators

// Start the server after syncing the database
sequelize
  .sync({ alter: true }) // Use alter: true to update the schema
  .then(async () => {
    console.log("Database synced.");

    // Check if admin user exists
    const existingUser = await User.findOne({ where: { username: "admin" } });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash("password123", 10);
      await User.create({ username: "admin", password: hashedPassword });
      console.log("Admin user created: username: admin, password: password123");
    }

    // Start the server
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Start the cleanup job
    startCleanupJob();
  })
  .catch((err) => {
    console.error("Error syncing database:", err);
  });

// Cleanup job to mark inactive visitors
function startCleanupJob() {
  const cleanupInterval = 10000; // Run every 10 seconds
  const inactivityTimeout = 15000; // Mark as offline if no heartbeat within 15 seconds

  setInterval(async () => {
    const cutoffTime = new Date(Date.now() - inactivityTimeout);
    try {
      const [updatedCount] = await Visitor.update(
        { active: false },
        {
          where: {
            active: true,
            lastActive: { [Op.lt]: cutoffTime }, // Use Sequelize.Op for less-than operator
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
