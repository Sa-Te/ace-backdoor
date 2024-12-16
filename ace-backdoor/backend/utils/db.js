const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false, // Disable Sequelize logging for clean output
  }
);

sequelize
  .authenticate()
  .then(() => console.log("Database connection established"))
  .catch((err) => console.error("Error connecting to the database:", err));

module.exports = sequelize;
