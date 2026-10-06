const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide user'],
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
  checkInDate: {
    type: Date,
    required: [true, 'Please provide check-in date'],
  },
  checkOutDate: {
    type: Date,
    required: [true, 'Please provide check-out date'],
  },
  numberOfGuests: {
    type: Number,
    required: [true, 'Please provide number of guests'],
    min: 1,
  },
  totalAmount: {
    type: Number,
    required: [true, 'Please provide total amount'],
    min: 0,
  },
  approvalStatus: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  },
  bookingStatus: {
    type: String,
    enum: ['REQUESTED', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'],
    default: 'REQUESTED',
  },
  paymentStatus: {
    type: String,
    enum: ['PAID', 'PENDING'],
    default: 'PENDING',
  },
  rejectionReason: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate booking number before saving
bookingSchema.pre('save', async function (next) {
  if (!this.bookingNumber) {
    const timestamp = Date.now();
    this.bookingNumber = `BK${timestamp}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
