const express = require('express');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');
const {
  getAllAllocations,
  createAllocation,
  getAllocationById,
} = require('../controllers/allocationController');

const router = express.Router();

// All allocation routes require authentication
router.use(authenticate);

// Get all allocations (Hotel Manager, Admin, Receptionist)
router.get('/', authorize(['HOTEL_MANAGER', 'ADMIN', 'RECEPTIONIST']), getAllAllocations);

// Create allocation (Hotel Manager, Admin, Receptionist) - Manual allocation
router.post('/', authorize(['HOTEL_MANAGER', 'ADMIN', 'RECEPTIONIST']), createAllocation);

// Get allocation by ID (Any authenticated user)
router.get('/:id', getAllocationById);

module.exports = router;
