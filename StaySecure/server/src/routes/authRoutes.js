const express = require('express');
const authenticate = require('../middleware/auth');
const { authRateLimit } = require('../middleware/authSecurity');
const { register, login, logout, getCurrentUser } = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/register', authRateLimit, register);
router.post('/login', authRateLimit, login);
router.post('/logout', authRateLimit, logout);

// Protected routes
router.get('/me', authenticate, getCurrentUser);

module.exports = router;
