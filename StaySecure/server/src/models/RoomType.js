const mongoose = require('mongoose');

const roomTypeSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Please provide property'],
  },
  name: {
    type: String,
    required: [true, 'Please provide room type name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide capacity'],
    min: 1,
  },
  pricePerDay: {
    type: Number,
    required: [true, 'Please provide price per day'],
    min: 0,
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

roomTypeSchema.index({ property: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('RoomType', roomTypeSchema);
