const express = require('express');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');
const {
  getSettings,
  updateSettings,
} = require('../controllers/settingsController');

const router = express.Router();

// Get settings (public)
router.get('/', getSettings);

// Update settings (Admin, Hotel Manager for their property)
router.patch('/', authenticate, authorize(['ADMIN', 'HOTEL_MANAGER']), updateSettings);

module.exports = router;
