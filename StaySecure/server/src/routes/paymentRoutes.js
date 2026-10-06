const express = require('express');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');
const {
  getAllPayments,
  getPaymentById,
  recordPayment,
} = require('../controllers/paymentController');

const router = express.Router();

// All payment routes require authentication
router.use(authenticate);

// Get all payments (Accountant, Admin)
router.get('/', authorize(['ACCOUNTANT', 'ADMIN']), getAllPayments);

// Get payment by ID (Any authenticated user)
router.get('/:id', getPaymentById);

// Record payment (Accountant, Admin)
router.post('/', authorize(['ACCOUNTANT', 'ADMIN']), recordPayment);

module.exports = router;
