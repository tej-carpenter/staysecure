const express = require('express');
const authenticate = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const authorize = require('../middleware/role');
const {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getAvailableRooms,
} = require('../controllers/roomController');

const router = express.Router();

// Get all rooms (public)
router.get('/', optionalAuth, getAllRooms);

// Get available rooms (public) - query endpoint
router.get('/available', getAvailableRooms);

// Get room by ID (public)
router.get('/:id', getRoomById);

// Create room (Admin, Hotel Manager)
router.post('/', authenticate, authorize(['ADMIN', 'HOTEL_MANAGER']), createRoom);

// Update room (Admin, Hotel Manager)
router.patch('/:id', authenticate, authorize(['ADMIN', 'HOTEL_MANAGER']), updateRoom);

// Delete room (Admin, Hotel Manager)
router.delete('/:id', authenticate, authorize(['ADMIN', 'HOTEL_MANAGER']), deleteRoom);

module.exports = router;
