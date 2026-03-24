const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');

// Placeholder — user feature coming next
router.get('/ping', protect, (req, res) => {
  res.json({ message: 'user route alive', user: req.user.name });
});

module.exports = router;
