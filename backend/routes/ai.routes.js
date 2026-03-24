const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { getRoadmap } = require('../controllers/ai.controller');

router.post('/roadmap', protect, getRoadmap);

module.exports = router;