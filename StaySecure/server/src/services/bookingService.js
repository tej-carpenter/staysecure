const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Allocation = require('../models/Allocation');
const Payment = require('../models/Payment');

// Check if rooms are available for the requested dates
const checkAvailability = async (roomTypeId, checkInDate, checkOutDate, numberOfGuests, locationId, propertyId) => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  // Find rooms of the requested type
  const roomQuery = { roomType: roomTypeId };
  if (propertyId) roomQuery.property = propertyId;
  if (locationId) roomQuery.location = locationId;
  const rooms = await Room.find(roomQuery).populate('property').populate('roomType').populate('location');

  const availableRooms = [];

  for (const room of rooms) {
    // Check if room status is AVAILABLE
    if (room.status !== 'AVAILABLE') {
      continue;
    }

    // Check if capacity is sufficient
    if (room.capacity < numberOfGuests) {
      continue;
    }

    // Check for date conflicts
    const conflictingAllocations = await Allocation.find({
      room: room._id,
    }).populate({
      path: 'booking',
      match: {
        bookingStatus: { $in: ['CONFIRMED', 'CHECKED_IN'] },
      },
    });

    let hasConflict = false;
    for (const allocation of conflictingAllocations) {
      if (!allocation.booking) continue;

      const existingCheckIn = new Date(allocation.booking.checkInDate);
      const existingCheckOut = new Date(allocation.booking.checkOutDate);

      // Check for date overlap
      if (existingCheckIn < checkOut && existingCheckOut > checkIn) {
        hasConflict = true;
        break;
      }
    }

    if (!hasConflict) {
      availableRooms.push(room);
    }
  }

  return availableRooms;
};

// Find first suitable room
const findSuitableRoom = async (roomTypeId, checkInDate, checkOutDate, numberOfGuests, locationId, propertyId) => {
  const availableRooms = await checkAvailability(roomTypeId, checkInDate, checkOutDate, numberOfGuests, locationId, propertyId);

  if (availableRooms.length === 0) {
    return null;
  }

  return availableRooms[0]; // Return first suitable room
};

// Auto allocate room and confirm booking
const autoAllocateAndConfirmBooking = async (booking, userId) => {
  try {
    // Find suitable room
    const room = await findSuitableRoom(
      booking.roomType,
      booking.checkInDate,
      booking.checkOutDate,
      booking.numberOfGuests,
      booking.location,
      booking.property
    );

    if (!room) {
      return {
        success: false,
        message: 'No suitable room available for the selected dates.',
      };
    }

    // Create allocation
    const allocation = await Allocation.create({
      booking: booking._id,
      room: room._id,
      allocatedBy: userId,
      allocationType: 'AUTOMATIC',
    });

    // Update booking status
    booking.approvalStatus = 'APPROVED';
    booking.bookingStatus = 'CONFIRMED';
    await booking.save();

    // Update room status
    room.status = 'OCCUPIED';
    await room.save();

    // Create payment record
    const payment = await Payment.create({
      booking: booking._id,
      amount: booking.totalAmount,
      paymentMethod: 'PENDING',
      status: 'PENDING',
    });

    return {
      success: true,
      message: 'Booking confirmed and room allocated automatically.',
      booking,
      allocation,
      payment,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  checkAvailability,
  findSuitableRoom,
  autoAllocateAndConfirmBooking,
};
