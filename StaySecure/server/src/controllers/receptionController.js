const Booking = require('../models/Booking');
const Allocation = require('../models/Allocation');
const Room = require('../models/Room');
const { buildAuditEntry, logAuditEvent } = require('../services/auditService');

// Check-in (Receptionist)
const checkIn = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('roomType');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Booking must be confirmed
    if (booking.bookingStatus !== 'CONFIRMED') {
      return res.status(400).json({
        success: false,
        message: 'Only confirmed bookings can be checked in.',
      });
    }

    // Check if room is allocated
    const allocation = await Allocation.findOne({ booking: req.params.id }).populate('room');

    if (!allocation) {
      return res.status(400).json({
        success: false,
        message: 'Room not allocated for this booking.',
      });
    }

    booking.bookingStatus = 'CHECKED_IN';
    await booking.save();

    const room = await Room.findByIdAndUpdate(allocation.room._id, { status: 'OCCUPIED' }, { new: true });

    const auditEntry = buildAuditEntry({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'CHECK_IN',
      resourceType: 'Booking',
      resourceId: booking._id,
      details: { bookingNumber: booking.bookingNumber, roomId: room._id },
    });
    await logAuditEvent({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'CHECK_IN',
      resourceType: 'Booking',
      resourceId: String(booking._id),
      details: { bookingNumber: booking.bookingNumber, roomId: room._id },
    });

    res.status(200).json({
      success: true,
      message: 'Customer checked in successfully.',
      booking,
      room,
      audit: auditEntry,
    });
  } catch (error) {
    next(error);
  }
};

// Check-out (Receptionist - allows check-out at any date)
const checkOut = async (req, res, next) => {
  try {
    const { reason } = req.body || {};
    const booking = await Booking.findById(req.params.id).populate('roomType').populate('property');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Booking must be checked in
    if (booking.bookingStatus !== 'CHECKED_IN') {
      return res.status(400).json({
        success: false,
        message: 'Only checked-in bookings can be checked out.',
      });
    }

    // Get allocation
    const allocation = await Allocation.findOne({ booking: req.params.id }).populate('room');

    if (!allocation) {
      return res.status(400).json({
        success: false,
        message: 'Room allocation not found for this checked-in booking.',
      });
    }

    const now = new Date();
    const isEarlyCheckOut = booking.checkOutDate && new Date(booking.checkOutDate) > now;

    booking.bookingStatus = 'CHECKED_OUT';
    booking.actualCheckOutDate = now;
    if (reason) {
      booking.checkOutReason = reason;
    }
    await booking.save();

    const room = await Room.findByIdAndUpdate(allocation.room._id, { status: 'AVAILABLE' }, { new: true });

    const auditDetails = {
      bookingNumber: booking.bookingNumber,
      roomId: room ? room._id : null,
      roomNumber: room ? room.roomNumber : null,
      isEarlyCheckOut,
      reason: reason || (isEarlyCheckOut ? 'Early checkout' : 'Regular checkout'),
      actualCheckOutDate: now,
    };

    const auditEntry = buildAuditEntry({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'CHECK_OUT',
      resourceType: 'Booking',
      resourceId: booking._id,
      details: auditDetails,
    });
    await logAuditEvent({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'CHECK_OUT',
      resourceType: 'Booking',
      resourceId: String(booking._id),
      details: auditDetails,
    });

    res.status(200).json({
      success: true,
      message: isEarlyCheckOut
        ? `Customer checked out early successfully (${reason || 'Departure confirmed'}). Room is now available.`
        : 'Customer checked out successfully. Room is now available.',
      booking,
      room,
      audit: auditEntry,
    });
  } catch (error) {
    next(error);
  }
};

// Get today's check-ins (Receptionist)
const getTodayCheckIns = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const checkIns = await Booking.find({
      bookingStatus: 'CONFIRMED',
      checkInDate: { $gte: today, $lt: tomorrow },
    })
      .populate('user')
      .populate('roomType')
      .populate('property');

    // Attach allocated room info
    const bookingIds = checkIns.map((b) => b._id);
    const allocations = await Allocation.find({ booking: { $in: bookingIds } }).populate('room');
    const allocationMap = new Map(allocations.map((a) => [String(a.booking), a.room]));

    const checkInsWithRoom = checkIns.map((b) => {
      const bObj = b.toObject();
      bObj.allocatedRoom = allocationMap.get(String(b._id)) || null;
      return bObj;
    });

    res.status(200).json({
      success: true,
      count: checkInsWithRoom.length,
      checkIns: checkInsWithRoom,
    });
  } catch (error) {
    next(error);
  }
};

// Get all currently checked-in guests (allows checkout at any date)
const getCheckedInGuests = async (req, res, next) => {
  try {
    const query = { bookingStatus: 'CHECKED_IN' };

    const checkedInList = await Booking.find(query)
      .populate('user')
      .populate('roomType')
      .populate('property')
      .sort({ checkInDate: -1 });

    const bookingIds = checkedInList.map((b) => b._id);
    const allocations = await Allocation.find({ booking: { $in: bookingIds } }).populate('room');
    const allocationMap = new Map(allocations.map((a) => [String(a.booking), a.room]));

    const guestsWithRoom = checkedInList.map((b) => {
      const bObj = b.toObject();
      bObj.allocatedRoom = allocationMap.get(String(b._id)) || null;
      return bObj;
    });

    res.status(200).json({
      success: true,
      count: guestsWithRoom.length,
      checkOuts: guestsWithRoom,
      guests: guestsWithRoom,
    });
  } catch (error) {
    next(error);
  }
};

// Get today's check-outs (Receptionist)
const getTodayCheckOuts = async (req, res, next) => {
  try {
    // If query ?all=true, return all checked-in bookings regardless of date
    if (req.query.all === 'true') {
      return getCheckedInGuests(req, res, next);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const checkOuts = await Booking.find({
      bookingStatus: 'CHECKED_IN',
      checkOutDate: { $gte: today, $lt: tomorrow },
    })
      .populate('user')
      .populate('roomType')
      .populate('property');

    const bookingIds = checkOuts.map((b) => b._id);
    const allocations = await Allocation.find({ booking: { $in: bookingIds } }).populate('room');
    const allocationMap = new Map(allocations.map((a) => [String(a.booking), a.room]));

    const checkOutsWithRoom = checkOuts.map((b) => {
      const bObj = b.toObject();
      bObj.allocatedRoom = allocationMap.get(String(b._id)) || null;
      return bObj;
    });

    res.status(200).json({
      success: true,
      count: checkOutsWithRoom.length,
      checkOuts: checkOutsWithRoom,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkIn,
  checkOut,
  getTodayCheckIns,
  getTodayCheckOuts,
  getCheckedInGuests,
};
