const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide property name'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['HOTEL', 'PG', 'HOSTEL', 'GUEST_HOUSE', 'DORMITORY'],
    required: [true, 'Please provide property type'],
  },
  address: {
    type: String,
    trim: true,
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvalMode: {
    type: String,
    enum: ['AUTOMATIC', 'MANUAL'],
    default: 'MANUAL',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

propertySchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Property', propertySchema);
