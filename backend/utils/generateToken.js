const jwt = require('jsonwebtoken');

// Creates a signed JWT containing the user's MongoDB _id
// Token expires after 7 days (configurable via .env)
// Frontend stores this in localStorage and sends it in every request header
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = generateToken;
