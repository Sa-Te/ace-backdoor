const bcrypt = require("bcrypt");

const verifyPassword = async () => {
  const hash = " $2b$10$6dk0YHisCfsJHt9fOJiNfeucj3AaYVMZ01wzl2ZeocW23nxcMWvAK";
  const isMatch = await bcrypt.compare("password123", hash);
  console.log("Password Match:", isMatch); // Should be true if the hash is correct
};

verifyPassword();
