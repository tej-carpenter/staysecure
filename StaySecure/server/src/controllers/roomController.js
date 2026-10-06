const Room = require('../models/Room');
const RoomType = require('../models/RoomType');
const Property = require('../models/Property');
const { checkAvailability } = require('../services/bookingService');
const { ensurePropertyAccess, getManagedPropertyIds } = require('../utils/propertyAccess');

// Get all rooms
const getAllRooms = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.property) query.property = req.query.property;
    if (req.query.location) query.location = req.query.location;

    if (req.user?.role === 'HOTEL_MANAGER') {
      query.property = { $in: await getManagedPropertyIds(req.user) };
    }

    const rooms = await Room.find(query).populate('property').populate('roomType').populate('location');

    res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    next(error);
  }
};

// Get room by ID
const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('property').populate('roomType').populate('location');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    next(error);
  }
};

// Create room (Admin, Hotel Manager)
const createRoom = async (req, res, next) => {
  try {
    const { roomNumber, property, roomType, location, floor, capacity } = req.body;

    // Validate input
    if (!roomNumber || !property || !roomType || !floor || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide property and all required room fields.',
      });
    }

    if (!(await ensurePropertyAccess(req.user, property))) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage rooms for your assigned property.',
      });
    }

    const propertyObj = await Property.findById(property);
    if (!propertyObj) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    const roomTypeObj = await RoomType.findOne({ _id: roomType, property });
    if (!roomTypeObj) {
      return res.status(400).json({
        success: false,
        message: 'Selected room type does not belong to this property.',
      });
    }

    const roomLocation = location || propertyObj.location;

    const room = await Room.create({
      roomNumber,
      property,
      roomType,
      location: roomLocation,
      floor,
      capacity,
      status: 'AVAILABLE',
    });

    await room.populate(['property', 'roomType', 'location']);

    res.status(201).json({
      success: true,
      message: 'Room created successfully.',
      room,
    });
  } catch (error) {
    next(error);
  }
};

// Update room (Admin, Hotel Manager)
const updateRoom = async (req, res, next) => {
  try {
    const { roomNumber, property, roomType, location, floor, capacity, status } = req.body;

    const existingRoom = await Room.findById(req.params.id);
    if (!existingRoom) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    if (!(await ensurePropertyAccess(req.user, property || existingRoom.property))) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage rooms for your assigned property.',
      });
    }

    if (property && req.user.role === 'HOTEL_MANAGER' && String(property) !== String(existingRoom.property)) {
      return res.status(403).json({
        success: false,
        message: 'You cannot move a room to another property.',
      });
    }

    let updateData = {};
    if (roomNumber) updateData.roomNumber = roomNumber;
    if (property && req.user.role === 'ADMIN') updateData.property = property;
    if (roomType) {
      const roomTypeObj = await RoomType.findOne({ _id: roomType, property: updateData.property || existingRoom.property });
      if (!roomTypeObj) {
        return res.status(400).json({
          success: false,
          message: 'Selected room type does not belong to this property.',
        });
      }
      updateData.roomType = roomType;
    }
    if (location) updateData.location = location;
    if (floor) updateData.floor = floor;
    if (capacity) updateData.capacity = capacity;
    if (status) updateData.status = status;

    const room = await Room.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('property').populate('roomType').populate('location');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Room updated successfully.',
      room,
    });
  } catch (error) {
    next(error);
  }
};

// Delete room (Admin and Hotel Manager for their property)
const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    if (!(await ensurePropertyAccess(req.user, room.property))) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage rooms for your assigned property.',
      });
    }

    await Room.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Get available rooms
const getAvailableRooms = async (req, res, next) => {
  try {
    const { property, roomType, location, checkIn, checkOut, guests } = req.query;

    // Validate input
    if (!property || !roomType || !checkIn || !checkOut || !guests) {
      return res.status(400).json({
        success: false,
        message: 'Please provide property, roomType, checkIn, checkOut, and guests.',
      });
    }

    const availableRooms = await checkAvailability(
      roomType,
      new Date(checkIn),
      new Date(checkOut),
      parseInt(guests),
      location,
      property
    );

    res.status(200).json({
      success: true,
      count: availableRooms.length,
      rooms: availableRooms,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getAvailableRooms,
};
