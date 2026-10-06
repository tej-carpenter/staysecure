const User = require('../models/User');
const { sanitizeText, isValidEmail, normalizeEmail } = require('../utils/validation');
const { isAllowedRoleAssignment } = require('../utils/rbac');

// Get all users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (req.user.role !== 'ADMIN' && req.user.id !== String(user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only access your own user profile.',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Create user (Admin only)
const createUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Validate input
    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists.',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update user
const updateUser = async (req, res, next) => {
  try {
    const { name, email, phone, role } = req.body;

    if (req.user.role !== 'ADMIN' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own profile.',
      });
    }

    let updateData = {};
    if (name) updateData.name = sanitizeText(name);
    if (email) {
      const normalizedEmail = normalizeEmail(email);
      if (!isValidEmail(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address.',
        });
      }
      updateData.email = normalizedEmail;
    }
    if (phone) updateData.phone = sanitizeText(phone);
    if (role && req.user.role === 'ADMIN') {
      if (!isAllowedRoleAssignment(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role assignment.',
        });
      }
      updateData.role = role;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Verify user email (Admin only)
const verifyUserEmail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { emailVerified: true, emailVerificationToken: null },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User email verified successfully.',
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  verifyUserEmail,
};
