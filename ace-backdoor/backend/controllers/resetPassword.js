const bcrypt = require("bcrypt");
const { sequelize, User } = require("../models/index"); // Load User from models/index.js

(async () => {
  try {
    // Sync the database (optional, can be skipped if already synced)
    await sequelize.authenticate();
    console.log("Database connected.");

    // Hash the new password
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Update the password for the admin user
    const [updatedRows] = await User.update(
      { password: hashedPassword },
      { where: { username: "admin" } }
    );

    console.log("Update result:", updatedRows); // Log updated rows count

    if (updatedRows > 0) {
      console.log("Admin password reset to: password123");
    } else {
      console.log("Admin user not found. No password updated.");
    }
  } catch (error) {
    console.error("Error resetting admin password:", error);
  } finally {
    await sequelize.close();
  }
})();
