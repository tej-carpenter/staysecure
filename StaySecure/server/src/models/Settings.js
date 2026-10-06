const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  approvalMode: {
    type: String,
    enum: ['AUTOMATIC', 'MANUAL'],
    default: 'MANUAL',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Settings', settingsSchema);
