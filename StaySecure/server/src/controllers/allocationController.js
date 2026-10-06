const Allocation = require('../models/Allocation');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { manuallyAllocateRoom } = require('../services/allocationService');
const { getManagedPropertyIds } = require('../utils/propertyAccess');

// Get all allocations
const getAllAllocations = async (req, res, next) => {
  try {
    const managedPropertyIds = await getManagedPropertyIds(req.user);
    const allocations = await Allocation.find()
      .populate({
        path: 'booking',
        match: managedPropertyIds ? { property: { $in: managedPropertyIds } } : {},
        populate: ['property', 'roomType', 'user'],
      })
      .populate({ path: 'room', populate: ['property', 'roomType'] })
      .populate('allocatedBy');
    const visibleAllocations = managedPropertyIds ? allocations.filter((allocation) => allocation.booking) : allocations;

    res.status(200).json({
      success: true,
      count: visibleAllocations.length,
      allocations: visibleAllocations,
    });
  } catch (error) {
    next(error);
  }
};

// Create allocation (Manual - Room Manager)
const createAllocation = async (req, res, next) => {
  try {
    const { bookingId, roomId } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!bookingId || !roomId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide bookingId and roomId.',
      });
    }

    // Use allocation service to validate and allocate
    const allocation = await manuallyAllocateRoom(bookingId, roomId, userId, req.user.role);

    res.status(201).json({
      success: true,
      message: 'Room allocated successfully.',
      allocation,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get allocation by ID
const getAllocationById = async (req, res, next) => {
  try {
    const allocation = await Allocation.findById(req.params.id)
      .populate('booking')
      .populate('room')
      .populate('allocatedBy');

    if (!allocation) {
      return res.status(404).json({
        success: false,
        message: 'Allocation not found.',
      });
    }

    const privilegedRoles = ['ADMIN', 'HOTEL_MANAGER', 'RECEPTIONIST'];
    const isBookingOwner = allocation.booking && String(allocation.booking.user) === String(req.user.id);
    if (!privilegedRoles.includes(req.user.role) && !isBookingOwner) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this allocation.',
      });
    }

    res.status(200).json({
      success: true,
      allocation,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAllocations,
  createAllocation,
  getAllocationById,
};
