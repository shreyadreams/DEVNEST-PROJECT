const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

// PROTECT MIDDLEWARE
// Runs before any protected route handler
// Flow: Request → protect() checks token → if valid, attach user → next()
// Usage: router.get('/me', protect, getMe)
const protect = async (req, res, next) => {
  let token;

  // Token arrives in header: "Authorization: Bearer eyJhbGci..."
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]; // Extract after "Bearer "

      // Verify token hasn't been tampered with or expired
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from DB, attach to req (minus password)
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Token valid → continue to route handler
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
