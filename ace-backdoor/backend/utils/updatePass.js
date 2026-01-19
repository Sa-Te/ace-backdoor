// 1. Load Environment Variables FIRST
require("dotenv").config();

const bcrypt = require("bcrypt");
const { sequelize, User } = require("../models");

(async () => {
  try {
    // 2. Check if Env vars are loaded
    if (!process.env.DB_USER) {
      throw new Error(
        "❌ .env variables not found! Make sure you are running this from the backend folder."
      );
    }

    // 3. Connect DB
    await sequelize.authenticate();
    console.log("✅ Database Connected.");

    // 4. Update Password
    // The password you requested: fZT&M2M$nXi!
    const newPass = "fZT&M2M$nXi!";
    const hashedPassword = await bcrypt.hash(newPass, 10);

    const [updated] = await User.update(
      { password: hashedPassword },
      { where: { username: "admin" } }
    );

    if (updated) {
      console.log("✅ Password updated successfully for 'admin'");
      console.log(`🔑 New Password: ${newPass}`);
    } else {
      // If user doesn't exist, create it
      const adminExists = await User.findOne({ where: { username: "admin" } });
      if (!adminExists) {
        await User.create({ username: "admin", password: hashedPassword });
        console.log("✅ Admin user did not exist, so I created it.");
      } else {
        console.log(
          "⚠️ User found but update returned 0 changes (Password might be same)."
        );
      }
    }
  } catch (e) {
    console.error("❌ Error:", e.message);
  } finally {
    await sequelize.close();
  }
})();
