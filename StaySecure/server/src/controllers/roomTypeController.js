const RoomType = require('../models/RoomType');
const { ensurePropertyAccess, getManagedPropertyIds } = require('../utils/propertyAccess');

// Get all room types
const getAllRoomTypes = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.property) query.property = req.query.property;

    if (req.user?.role === 'HOTEL_MANAGER') {
      query.property = { $in: await getManagedPropertyIds(req.user) };
    }

    const roomTypes = await RoomType.find(query).populate('property');

    res.status(200).json({
      success: true,
      count: roomTypes.length,
      roomTypes,
    });
  } catch (error) {
    next(error);
  }
};

// Get room type by ID
const getRoomTypeById = async (req, res, next) => {
  try {
    const roomType = await RoomType.findById(req.params.id).populate('property');

    if (!roomType) {
      return res.status(404).json({
        success: false,
        message: 'Room type not found.',
      });
    }

    res.status(200).json({
      success: true,
      roomType,
    });
  } catch (error) {
    next(error);
  }
};

// Create room type (Admin only)
const createRoomType = async (req, res, next) => {
  try {
    const { property, name, description, capacity, pricePerDay, isActive } = req.body;

    // Validate input
    if (!property || !name || !description || !capacity || pricePerDay === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide property and all required room type fields.',
      });
    }

    if (!(await ensurePropertyAccess(req.user, property))) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage room types for your assigned property.',
      });
    }

    const roomType = await RoomType.create({
      property,
      name,
      description,
      capacity,
      pricePerDay,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      message: 'Room type created successfully.',
      roomType,
    });
  } catch (error) {
    next(error);
  }
};

// Update room type (Admin only)
const updateRoomType = async (req, res, next) => {
  try {
    const { property, name, description, capacity, pricePerDay, isActive } = req.body;

    const existingRoomType = await RoomType.findById(req.params.id);
    if (!existingRoomType) {
      return res.status(404).json({
        success: false,
        message: 'Room type not found.',
      });
    }

    if (!(await ensurePropertyAccess(req.user, property || existingRoomType.property))) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage room types for your assigned property.',
      });
    }

    let updateData = {};
    if (property && req.user.role === 'ADMIN') updateData.property = property;
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (capacity) updateData.capacity = capacity;
    if (pricePerDay !== undefined) updateData.pricePerDay = pricePerDay;
    if (isActive !== undefined) updateData.isActive = isActive;

    const roomType = await RoomType.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('property');

    if (!roomType) {
      return res.status(404).json({
        success: false,
        message: 'Room type not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Room type updated successfully.',
      roomType,
    });
  } catch (error) {
    next(error);
  }
};

// Delete room type (Admin, Hotel Manager for their property)
const deleteRoomType = async (req, res, next) => {
  try {
    const roomType = await RoomType.findById(req.params.id);

    if (!roomType) {
      return res.status(404).json({
        success: false,
        message: 'Room type not found.',
      });
    }

    if (!(await ensurePropertyAccess(req.user, roomType.property))) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage room types for your assigned property.',
      });
    }

    await RoomType.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Room type deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRoomTypes,
  getRoomTypeById,
  createRoomType,
  updateRoomType,
  deleteRoomType,
};
