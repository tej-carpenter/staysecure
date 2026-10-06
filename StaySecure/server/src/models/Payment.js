const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Please provide booking'],
  },
  amount: {
    type: Number,
    required: [true, 'Please provide amount'],
    min: 0,
  },
  paymentMethod: {
    type: String,
    enum: ['PENDING', 'CASH', 'UPI', 'CARD', 'BANK_TRANSFER'],
    required: [true, 'Please provide payment method'],
  },
  status: {
    type: String,
    enum: ['PAID', 'PENDING'],
    default: 'PENDING',
  },
  paymentDate: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Payment', paymentSchema);
