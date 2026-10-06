const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const {
  getLoginAttemptKey,
  clearLoginAttempt,
  isLoginLockedOut,
  recordFailedLoginAttempt,
} = require('../middleware/authSecurity');
const { isValidEmail, validatePassword, normalizeEmail, sanitizeText } = require('../utils/validation');
const { PUBLIC_SIGNUP_ROLE, isAllowedRoleAssignment } = require('../utils/rbac');

const setAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// Register user
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    const safeName = sanitizeText(name);
    const normalizedEmail = normalizeEmail(email);
    const safePhone = sanitizeText(phone);

    if (!safeName || !normalizedEmail || !safePhone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields.',
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 12 characters and include uppercase, lowercase, number, and special character.',
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists.',
      });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      name: safeName,
      email: normalizedEmail,
      phone: safePhone,
      password,
      role: PUBLIC_SIGNUP_ROLE,
      emailVerified: false,
      emailVerificationToken: verificationToken,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Email verification is required before full access is granted.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const attemptKey = getLoginAttemptKey(normalizedEmail, req);
    if (isLoginLockedOut(attemptKey)) {
      return res.status(429).json({
        success: false,
        message: 'Too many failed login attempts. Please try again later.',
      });
    }

    // Find user and select password field
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      recordFailedLoginAttempt(attemptKey);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in.',
      });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      recordFailedLoginAttempt(attemptKey);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    clearLoginAttempt(attemptKey);

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Logout user
const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

// Get current user
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-emailVerificationToken');

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
};
