const express = require('express');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');
const {
  getLocations,
  getAllLocations,
  createLocation,
  updateLocation,
} = require('../controllers/locationController');

const router = express.Router();

router.get('/', getLocations);
router.get('/all', authenticate, authorize(['ADMIN', 'HOTEL_MANAGER', 'RECEPTIONIST']), getAllLocations);
router.post('/', authenticate, authorize('ADMIN'), createLocation);
router.patch('/:id', authenticate, authorize('ADMIN'), updateLocation);

module.exports = router;
