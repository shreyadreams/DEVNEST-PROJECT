const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getGithubStats,
  getGithubRepos,
  getContributionData
} = require('../controllers/github.controller');

router.get('/stats/:username',        protect, getGithubStats);
router.get('/repos/:username',         protect, getGithubRepos);
router.get('/contributions/:username', protect, getContributionData);

module.exports = router;