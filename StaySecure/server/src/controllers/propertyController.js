const mongoose = require('mongoose');
const Property = require('../models/Property');
const Location = require('../models/Location');
const { sanitizeText } = require('../utils/validation');

const propertyTypes = ['HOTEL', 'PG', 'HOSTEL', 'GUEST_HOUSE', 'DORMITORY'];
const approvalModes = ['AUTOMATIC', 'MANUAL'];

const buildPropertyQuery = (req, includeInactive = false) => {
  const query = {};

  if (!includeInactive) {
    query.isActive = true;
  }

  if (req.user?.role === 'HOTEL_MANAGER') {
    query.manager = req.user.id;
  }

  return query;
};

const getProperties = async (req, res, next) => {
  try {
    const query = buildPropertyQuery(req, false);
    const properties = await Property.find(query).populate('location').populate('manager', '-password');

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    next(error);
  }
};

const getAllProperties = async (req, res, next) => {
  try {
    const query = buildPropertyQuery(req, true);
    const properties = await Property.find(query).populate('location').populate('manager', '-password');

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    next(error);
  }
};

const getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).populate('location').populate('manager', '-password');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    if (req.user?.role === 'HOTEL_MANAGER' && String(property.manager) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only access your assigned property.',
      });
    }

    res.status(200).json({
      success: true,
      property,
    });
  } catch (error) {
    next(error);
  }
};

const resolveLocationAndAddress = async (locationInput, propertyName) => {
  if (!locationInput) return { locationId: undefined, addressText: undefined };
  if (mongoose.isValidObjectId(locationInput)) {
    return { locationId: locationInput, addressText: undefined };
  }
  if (typeof locationInput === 'string' && locationInput.trim()) {
    const rawText = sanitizeText(locationInput).trim();
    let loc = await Location.findOne({ address: rawText });
    if (!loc) {
      const parts = rawText.split(',').map((p) => p.trim()).filter(Boolean);
      const city = parts.length > 1 ? parts[parts.length - 1] : parts[0] || 'Central';
      loc = await Location.create({
        name: `${propertyName} Location`,
        address: rawText,
        city,
      });
    }
    return { locationId: loc._id, addressText: rawText };
  }
  return { locationId: undefined, addressText: undefined };
};

const createProperty = async (req, res, next) => {
  try {
    const { name, type, location, address, manager, approvalMode, isActive } = req.body;
    const safeName = sanitizeText(name);

    if (!safeName || !type || !propertyTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide property name and valid type.',
      });
    }

    if (approvalMode && !approvalModes.includes(approvalMode)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid approvalMode.',
      });
    }

    const { locationId, addressText } = await resolveLocationAndAddress(location || address, safeName);

    const property = await Property.create({
      name: safeName,
      type,
      address: addressText,
      location: locationId,
      manager,
      approvalMode: approvalMode || 'MANUAL',
      isActive: isActive !== undefined ? isActive : true,
    });

    await property.populate('location');
    await property.populate('manager', '-password');

    res.status(201).json({
      success: true,
      message: 'Property created successfully.',
      property,
    });
  } catch (error) {
    next(error);
  }
};

const updateProperty = async (req, res, next) => {
  try {
    const { name, type, location, address, manager, approvalMode, isActive } = req.body;
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    const isManager = property.manager && String(property.manager._id || property.manager) === String(req.user.id);
    if (req.user.role === 'HOTEL_MANAGER' && !isManager) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your assigned property.',
      });
    }

    if (name !== undefined && req.user.role === 'ADMIN') property.name = sanitizeText(name);
    if (type !== undefined && req.user.role === 'ADMIN') {
      const normalizedType = String(type).trim().toUpperCase();
      if (!propertyTypes.includes(normalizedType)) {
        return res.status(400).json({ success: false, message: 'Invalid property type.' });
      }
      property.type = normalizedType;
    }
    if ((location !== undefined || address !== undefined) && req.user.role === 'ADMIN') {
      const locVal = location !== undefined ? location : address;
      const { locationId, addressText } = await resolveLocationAndAddress(locVal, property.name);
      if (addressText) property.address = addressText;
      if (locationId) property.location = locationId;
      else if (!locVal) {
        property.location = undefined;
        property.address = undefined;
      }
    }
    if (manager !== undefined && req.user.role === 'ADMIN') property.manager = manager || undefined;
    if (isActive !== undefined && req.user.role === 'ADMIN') property.isActive = isActive;
    if (approvalMode !== undefined) {
      const normalizedMode = String(approvalMode).trim().toUpperCase();
      if (!approvalModes.includes(normalizedMode)) {
        return res.status(400).json({ success: false, message: 'Invalid approval mode.' });
      }
      property.approvalMode = normalizedMode;
    }

    await property.save();
    await property.populate('location');
    await property.populate('manager', '-password');

    res.status(200).json({
      success: true,
      message: 'Property updated successfully.',
      property,
    });
  } catch (error) {
    next(error);
  }
};

const updateApprovalMode = async (req, res, next) => {
  try {
    const { approvalMode } = req.body;
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    const isManager = property.manager && String(property.manager._id || property.manager) === String(req.user.id);
    if (req.user.role === 'HOTEL_MANAGER' && !isManager) {
      return res.status(403).json({
        success: false,
        message: 'You can only update approval mode for your assigned property.',
      });
    }

    const normalizedMode = approvalMode ? String(approvalMode).trim().toUpperCase() : '';
    if (!approvalModes.includes(normalizedMode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid approval mode. Must be AUTOMATIC or MANUAL.',
      });
    }

    property.approvalMode = normalizedMode;
    await property.save();
    await property.populate('location');
    await property.populate('manager', '-password');

    res.status(200).json({
      success: true,
      message: `Approval mode updated to ${normalizedMode} for ${property.name}.`,
      property,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProperties,
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  updateApprovalMode,
  propertyTypes,
};
