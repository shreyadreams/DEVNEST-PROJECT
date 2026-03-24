const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', register);   // Public
router.post('/login',    login);      // Public
router.get('/me',  protect, getMe);   // Protected — needs JWT

module.exports = router;
