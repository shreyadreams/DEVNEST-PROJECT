const User = require('../models/User.model');
const axios = require('axios');

// ─────────────────────────────────────────
// GET /api/user/profile
// ─────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────
// PUT /api/user/profile
// ─────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'name', 'bio', 'techStack','avatar',
      'githubUsername', 'leetcodeUsername',
      'gfgUsername', 'codeforcesUsername', 'codingNinjaUsername',
      'linkedinUrl'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        // Trim whitespace from usernames
        updates[field] = typeof req.body[field] === 'string'
          ? req.body[field].trim()
          : req.body[field];
      }
    });

    // If avatar uploaded via Cloudinary
    if (req.file?.path) {
      updates.avatar = req.file.path;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────
// POST /api/user/avatar
// Upload profile photo to Cloudinary
// ─────────────────────────────────────────
const uploadAvatar = async (req, res) => {
  try {
    console.log('Avatar upload hit!', req.file);
    if (!req.file?.path) {
      return res.status(400).json({ message: 'No image uploaded' });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: req.file.path },
      { new: true }
    );
    res.json({ success: true, avatar: req.file.path, user });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

// ─────────────────────────────────────────
// GET /api/user/heatmap/:username
// Fetch LeetCode submission heatmap from backend
// (avoids CORS issues when fetching from browser)
// ─────────────────────────────────────────
const getLeetCodeHeatmap = async (req, res) => {
  try {
    const { username } = req.params;

    const response = await axios.post(
      'https://leetcode.com/graphql',
      {
        query: `query($username: String!) {
          matchedUser(username: $username) {
            submissionCalendar
            submitStats {
              acSubmissionNum { difficulty count }
            }
            userCalendar {
              activeYears
              streak
              totalActiveDays
            }
          }
        }`,
        variables: { username }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com',
          'User-Agent': 'Mozilla/5.0'
        },
        timeout: 10000
      }
    );

    const data = response.data?.data?.matchedUser;
    if (!data) {
      return res.status(404).json({ message: 'LeetCode user not found' });
    }

    const calendar = JSON.parse(data.submissionCalendar || '{}');
    const totalActiveDays = data.userCalendar?.totalActiveDays || 0;
    const streak = data.userCalendar?.streak || 0;
    const nums = data.submitStats?.acSubmissionNum || [];
    const totalSubmissions = nums.reduce((a, b) => a + b.count, 0);

    res.json({
      success: true,
      calendar,
      totalActiveDays,
      streak,
      totalSubmissions
    });

  } catch (error) {
    console.log('Heatmap fetch error:', error.message);
    res.status(500).json({ message: 'Failed to fetch heatmap', error: error.message });
  }
};

module.exports = { getProfile, updateProfile, uploadAvatar, getLeetCodeHeatmap };