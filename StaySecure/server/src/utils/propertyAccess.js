const Property = require('../models/Property');

const getManagedPropertyIds = async (user) => {
  if (!user || user.role !== 'HOTEL_MANAGER') {
    return null;
  }

  const properties = await Property.find({ manager: user.id }).select('_id');
  return properties.map((property) => property._id);
};

const ensurePropertyAccess = async (user, propertyId) => {
  if (!user || user.role !== 'HOTEL_MANAGER') {
    return true;
  }

  const property = await Property.findOne({ _id: propertyId, manager: user.id });
  return !!property;
};

module.exports = {
  getManagedPropertyIds,
  ensurePropertyAccess,
};
