const express = require('express');
const authenticate = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const authorize = require('../middleware/role');
const {
  getAllRoomTypes,
  getRoomTypeById,
  createRoomType,
  updateRoomType,
  deleteRoomType,
} = require('../controllers/roomTypeController');

const router = express.Router();

// Get all room types (public)
router.get('/', optionalAuth, getAllRoomTypes);

// Get room type by ID (public)
router.get('/:id', getRoomTypeById);

// Create room type (Admin, Hotel Manager)
router.post('/', authenticate, authorize(['ADMIN', 'HOTEL_MANAGER']), createRoomType);

// Update room type (Admin, Hotel Manager)
router.patch('/:id', authenticate, authorize(['ADMIN', 'HOTEL_MANAGER']), updateRoomType);

// Delete room type (Admin, Hotel Manager)
router.delete('/:id', authenticate, authorize(['ADMIN', 'HOTEL_MANAGER']), deleteRoomType);

module.exports = router;
