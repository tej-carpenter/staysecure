const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Please provide booking'],
    unique: true,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Please provide room'],
  },
  allocatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide user who allocated'],
  },
  allocationType: {
    type: String,
    enum: ['AUTOMATIC', 'MANUAL'],
    required: [true, 'Please provide allocation type'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Allocation', allocationSchema);
