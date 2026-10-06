const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a location name'],
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Please provide an address'],
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'Please provide a city'],
    trim: true,
  },
  state: {
    type: String,
    trim: true,
    default: '',
  },
  country: {
    type: String,
    trim: true,
    default: '',
  },
  postalCode: {
    type: String,
    trim: true,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Location', locationSchema);
