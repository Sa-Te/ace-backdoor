require("dotenv").config(); // Load local .env
const bcrypt = require("bcrypt");
const { sequelize, User } = require("../models");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Local DB Connected.");

    const newPass = "fZT&M2M$nXi!"; // The secure password
    const hashedPassword = await bcrypt.hash(newPass, 10);

    // Update or Create Admin
    const [updated] = await User.update(
      { password: hashedPassword },
      { where: { username: "admin" } }
    );

    if (updated) {
      console.log("✅ Local Admin Password Updated!");
    } else {
      // If user doesn't exist, create it
      const admin = await User.findOne({ where: { username: "admin" } });
      if (!admin) {
        await User.create({ username: "admin", password: hashedPassword });
        console.log("✅ Admin user created.");
      } else {
        console.log("⚠️ Password matches existing hash.");
      }
    }
  } catch (e) {
    console.error("❌ Error:", e.message);
  } finally {
    await sequelize.close();
  }
})();
