const express = require('express');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');
const {
  createBooking,
  getAllBookings,
  getMyBookings,
  getApprovedBookings,
  getBookingById,
  getPendingBookings,
  approveBooking,
  rejectBooking,
  cancelBooking,
} = require('../controllers/bookingController');

const router = express.Router();

// All booking routes require authentication
router.use(authenticate);

// Create booking (Customer)
router.post('/', authorize('CUSTOMER'), createBooking);

// Get my bookings (Customer)
router.get('/my', authorize('CUSTOMER'), getMyBookings);

// Get all bookings (Admin, Hotel Manager, Accountant, Receptionist)
router.get('/', authorize(['ADMIN', 'HOTEL_MANAGER', 'ACCOUNTANT', 'RECEPTIONIST']), getAllBookings);

// Get approved bookings for allocation and downstream processing
router.get('/approved', authorize(['HOTEL_MANAGER', 'ADMIN', 'RECEPTIONIST']), getApprovedBookings);

// Get pending bookings (Hotel Manager, Admin)
router.get('/pending', authorize(['HOTEL_MANAGER', 'ADMIN']), getPendingBookings);

// Get booking by ID (Any authenticated user)
router.get('/:id', getBookingById);

// Approve booking (Hotel Manager, Admin)
router.patch('/:id/approve', authorize(['HOTEL_MANAGER', 'ADMIN']), approveBooking);

// Reject booking (Hotel Manager, Admin)
router.patch('/:id/reject', authorize(['HOTEL_MANAGER', 'ADMIN']), rejectBooking);

// Cancel booking (Customer, Admin)
router.patch('/:id/cancel', authorize(['CUSTOMER', 'ADMIN']), cancelBooking);

module.exports = router;
