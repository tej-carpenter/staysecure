const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'Please provide room number'],
    trim: true,
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Please provide property'],
  },
  roomType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RoomType',
    required: [true, 'Please provide room type'],
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
  },
  floor: {
    type: Number,
    required: [true, 'Please provide floor number'],
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide capacity'],
    min: 1,
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'OCCUPIED', 'BLOCKED'],
    default: 'AVAILABLE',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

roomSchema.index({ property: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model('Room', roomSchema);
