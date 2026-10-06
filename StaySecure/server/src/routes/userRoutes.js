const express = require('express');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  verifyUserEmail,
} = require('../controllers/userController');

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// Get all users (Admin only)
router.get('/', authorize('ADMIN'), getAllUsers);

// Get user by ID (Admin only)
router.get('/:id', authorize('ADMIN'), getUserById);

// Create user (Admin only)
router.post('/', authorize('ADMIN'), createUser);

// Update user (Admin or own customer profile)
router.patch('/:id', authorize(['ADMIN', 'CUSTOMER']), updateUser);

// Verify user email (Admin only)
router.patch('/:id/verify-email', authorize('ADMIN'), verifyUserEmail);

module.exports = router;
