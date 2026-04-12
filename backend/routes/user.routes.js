const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  getLeetCodeHeatmap
} = require('../controllers/user.controller');

// Profile
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Avatar upload
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

// LeetCode heatmap (no auth needed — public data)
router.get('/heatmap/:username', getLeetCodeHeatmap);

module.exports = router;