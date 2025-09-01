const bcrypt = require("bcrypt");
const { User } = require("../models/index.js");
const { generateToken } = require("../utils/jwtUtils");

/**
 * @file Handles user authentication.
 */

/**
 * Authenticates a user based on username and password.
 * @param {object} req - Express request object, expecting { username, password } in the body.
 * @param {object} res - Express response object.
 * @returns {Promise<void>} Sends a JWT token on successful login.
 */
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken({ id: user.id, username: user.username });
    res.json({ token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
