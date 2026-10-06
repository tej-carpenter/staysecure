const Settings = require('../models/Settings');
const Property = require('../models/Property');
const { ensurePropertyAccess } = require('../utils/propertyAccess');

// Get settings
const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();

    // If settings don't exist, create default
    if (!settings) {
      settings = await Settings.create({ approvalMode: 'MANUAL' });
    }

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

// Update settings (Admin & Hotel Manager for their property)
const updateSettings = async (req, res, next) => {
  try {
    const { approvalMode, propertyId } = req.body;

    const normalizedMode = approvalMode ? String(approvalMode).trim().toUpperCase() : '';
    // Validate input
    if (!normalizedMode || !['AUTOMATIC', 'MANUAL'].includes(normalizedMode)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid approvalMode (AUTOMATIC or MANUAL).',
      });
    }

    // If propertyId is provided, update that property's approval mode
    if (propertyId) {
      const property = await Property.findById(propertyId);
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found.',
        });
      }

      if (!(await ensurePropertyAccess(req.user, propertyId))) {
        return res.status(403).json({
          success: false,
          message: 'You can only update approval mode for your assigned property.',
        });
      }

      property.approvalMode = normalizedMode;
      await property.save();

      return res.status(200).json({
        success: true,
        message: `Approval mode updated to ${normalizedMode} for ${property.name}.`,
        property,
      });
    }

    // If no propertyId is provided, only ADMIN can update global fallback
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Hotel Managers must specify a propertyId to update approval mode.',
      });
    }

    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({ approvalMode: normalizedMode });
    } else {
      settings.approvalMode = normalizedMode;
      settings.updatedAt = new Date();
      await settings.save();
    }

    res.status(200).json({
      success: true,
      message: 'Global settings updated successfully.',
      settings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
