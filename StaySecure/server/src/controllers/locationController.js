const Location = require('../models/Location');

const getLocations = async (req, res, next) => {
  try {
    const locations = await Location.find({ isActive: true }).sort({ city: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: locations.length,
      locations,
    });
  } catch (error) {
    next(error);
  }
};

const getAllLocations = async (req, res, next) => {
  try {
    const locations = await Location.find().sort({ city: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: locations.length,
      locations,
    });
  } catch (error) {
    next(error);
  }
};

const createLocation = async (req, res, next) => {
  try {
    const { name, address, city, state, country, postalCode } = req.body;

    if (!name || !address || !city) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, address, and city.',
      });
    }

    const location = await Location.create({
      name,
      address,
      city,
      state,
      country,
      postalCode,
    });

    res.status(201).json({
      success: true,
      message: 'Location created successfully.',
      location,
    });
  } catch (error) {
    next(error);
  }
};

const updateLocation = async (req, res, next) => {
  try {
    const location = await Location.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Location updated successfully.',
      location,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLocations,
  getAllLocations,
  createLocation,
  updateLocation,
};
