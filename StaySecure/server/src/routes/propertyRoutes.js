const express = require('express');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');
const {
  getProperties,
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  updateApprovalMode,
} = require('../controllers/propertyController');

const router = express.Router();

router.get('/', getProperties);
router.get('/all', authenticate, authorize(['ADMIN', 'HOTEL_MANAGER']), getAllProperties);
router.get('/:id', getPropertyById);
router.post('/', authenticate, authorize('ADMIN'), createProperty);
router.patch('/:id/approval-mode', authenticate, authorize(['ADMIN', 'HOTEL_MANAGER']), updateApprovalMode);
router.patch('/:id', authenticate, authorize(['ADMIN', 'HOTEL_MANAGER']), updateProperty);

module.exports = router;
