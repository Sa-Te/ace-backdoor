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
      max: 10, // Maximum number of connections in pool
      min: 2, // Minimum number of connections
      acquire: 30000, // Timeout before throwing an error
      idle: 10000, // Connection is released after 10s of inactivity
    },
  }
);

sequelize
  .authenticate()
  .then(() => console.log("Database connection established"))
  .catch((err) => console.error("Error connecting to the database:", err));

module.exports = sequelize;
