const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
    pool: {
      max: 3, // Lower max connections to avoid hitting limit
      min: 1,
      acquire: 10000, // Shorter timeout to prevent blocking
      idle: 5000, // Close idle connections faster
    },
  }
);

// Close connections on shutdown
process.on("SIGINT", async () => {
  console.log("Closing Sequelize connection...");
  await sequelize.close();
  process.exit(0);
});

module.exports = sequelize;
