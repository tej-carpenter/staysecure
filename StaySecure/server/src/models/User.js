const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const { normalizeEmail, isValidEmail, validatePassword } = require('../utils/validation');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    minlength: 2,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: isValidEmail,
      message: 'Please provide a valid email address.',
    },
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    trim: true,
    match: /^[+()\d\s-]{7,20}$/,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 12,
    select: false,
    validate: {
      validator: validatePassword,
      message: 'Password must be at least 12 characters long and include uppercase, lowercase, number, and special character.',
    },
  },
  role: {
    type: String,
    enum: ['ADMIN', 'CUSTOMER', 'HOTEL_MANAGER', 'ACCOUNTANT', 'RECEPTIONIST'],
    default: 'CUSTOMER',
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre('validate', function (next) {
  if (this.email) {
    this.email = normalizeEmail(this.email);
  }
  if (this.name) {
    this.name = this.name.trim();
  }
  if (this.phone) {
    this.phone = this.phone.trim();
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (inputPassword) {
  return await bcryptjs.compare(inputPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
