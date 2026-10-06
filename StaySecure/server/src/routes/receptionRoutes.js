const express = require('express');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');
const {
  checkIn,
  checkOut,
  getTodayCheckIns,
  getTodayCheckOuts,
  getCheckedInGuests,
} = require('../controllers/receptionController');

const router = express.Router();

// All reception routes require authentication and Receptionist / Admin role
router.use(authenticate);
router.use(authorize(['RECEPTIONIST', 'ADMIN']));

// Check-in (supports both /:id/check-in and /check-in/:id, and /checkin)
router.patch('/:id/check-in', checkIn);
router.patch('/:id/checkin', checkIn);
router.patch('/check-in/:id', checkIn);
router.patch('/checkin/:id', checkIn);

// Check-out (allows check-out at any date, supports /:id/check-out, /:id/checkout, etc.)
router.patch('/:id/check-out', checkOut);
router.patch('/:id/checkout', checkOut);
router.patch('/check-out/:id', checkOut);
router.patch('/checkout/:id', checkOut);

// Get today's check-ins
router.get('/today/check-ins', getTodayCheckIns);
router.get('/today/checkins', getTodayCheckIns);

// Get today's check-outs
router.get('/today/check-outs', getTodayCheckOuts);
router.get('/today/checkouts', getTodayCheckOuts);

// Get all active checked-in guests (for check-out on any date / early departure)
router.get('/checked-in', getCheckedInGuests);
router.get('/checkedin', getCheckedInGuests);
router.get('/check-out', getCheckedInGuests);
router.get('/checkout', getCheckedInGuests);
router.get('/check-outs', getCheckedInGuests);
router.get('/checkouts', getCheckedInGuests);

module.exports = router;
