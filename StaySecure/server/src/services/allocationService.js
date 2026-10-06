const Allocation = require('../models/Allocation');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const { checkAvailability } = require('./bookingService');

// Manually allocate room to a booking
const manuallyAllocateRoom = async (bookingId, roomId, userId, userRole) => {
  try {
    // Get booking details
    const booking = await Booking.findById(bookingId).populate('property').populate('roomType');
    if (!booking) {
      throw new Error('Booking not found.');
    }

    // Booking must be approved
    if (booking.approvalStatus !== 'APPROVED') {
      throw new Error('Booking is not approved yet.');
    }

    // Booking must not already be allocated
    const existingAllocation = await Allocation.findOne({ booking: bookingId });
    if (existingAllocation) {
      throw new Error('Room already allocated to this booking.');
    }

    // Get room details
    const room = await Room.findById(roomId).populate('property').populate('roomType');
    if (!room) {
      throw new Error('Room not found.');
    }

    if (userRole === 'HOTEL_MANAGER' && String(booking.property?.manager || booking.property?.manager?._id) !== String(userId)) {
      throw new Error('You can only allocate rooms for your assigned property.');
    }

    if (String(room.property?._id || room.property) !== String(booking.property?._id || booking.property)) {
      throw new Error('Room must belong to the same property as the booking.');
    }

    // Room must be available
    if (room.status !== 'AVAILABLE') {
      throw new Error('Room is not available.');
    }

    // Room type must match
    if (room.roomType._id.toString() !== booking.roomType._id.toString()) {
      throw new Error('Room type does not match booking.');
    }

    // Room capacity must be sufficient
    if (room.capacity < booking.numberOfGuests) {
      throw new Error('Room capacity is not sufficient.');
    }

    // Check for date conflicts
    const availableRooms = await checkAvailability(
      booking.roomType._id,
      booking.checkInDate,
      booking.checkOutDate,
      booking.numberOfGuests,
      booking.location,
      booking.property?._id || booking.property
    );

    const roomAvailable = availableRooms.some((r) => r._id.toString() === roomId);
    if (!roomAvailable) {
      throw new Error('Room is not available for the selected dates.');
    }

    // Create allocation
    const allocation = await Allocation.create({
      booking: bookingId,
      room: roomId,
      allocatedBy: userId,
      allocationType: 'MANUAL',
    });

    // Update booking status
    booking.bookingStatus = 'CONFIRMED';
    await booking.save();

    // Update room status
    room.status = 'OCCUPIED';
    await room.save();

    return allocation;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  manuallyAllocateRoom,
};
