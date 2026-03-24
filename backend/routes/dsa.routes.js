const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');

const {
  getProblems,
  markSolved,
  markUnsolved,
  getUserProgress,
  seedProblems
} = require('../controllers/dsa.controller');

// Problems fetch karo (filters ke saath)
router.get('/problems', protect, getProblems);

// User ka progress dekho
router.get('/progress', protect, getUserProgress);

// Problem solve/unsolve karo
router.post('/solve/:problemId',   protect, markSolved);
router.post('/unsolve/:problemId', protect, markUnsolved);
router.post('/seed', protect, seedProblems);

module.exports = router;
