const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');

// In-memory user store fallback
let inMemoryUsers = [];

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * @desc    Register a new customer / user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, licenseNumber, address } = req.body;

    // Basic Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const emailLower = email.toLowerCase().trim();

    if (isDbConnected()) {
      try {
        const existingUser = await User.findOne({ email: emailLower });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Email address is already registered',
          });
        }

        const userRole = role ? role.toUpperCase() : 'CUSTOMER';
        const user = await User.create({
          name,
          email: emailLower,
          password,
          phone: phone || '',
          role: userRole,
          licenseNumber: licenseNumber || '',
          address: address || '',
        });

        const token = signToken({ id: user._id, email: user.email, role: user.role });
        const userObj = user.toObject();
        delete userObj.password;

        return res.status(201).json({
          success: true,
          message: 'User registered successfully',
          token,
          user: userObj,
        });
      } catch (err) {
        console.warn('[Auth] DB registration query failed, falling back to in-memory store:', err.message);
      }
    }

    // In-memory fallback
    const existing = inMemoryUsers.find((u) => u.email === emailLower);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email address is already registered',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const id = new mongoose.Types.ObjectId().toString();
    const userRole = role ? role.toUpperCase() : 'CUSTOMER';

    const newUser = {
      _id: id,
      id,
      name,
      email: emailLower,
      password: hashedPassword,
      phone: phone || '',
      role: userRole,
      licenseNumber: licenseNumber || '',
      address: address || '',
      createdAt: new Date().toISOString(),
    };

    inMemoryUsers.push(newUser);

    const token = signToken({ id: newUser._id, email: newUser.email, role: newUser.role });
    const { password: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const emailLower = email.toLowerCase().trim();

    if (isDbConnected()) {
      try {
        const user = await User.findOne({ email: emailLower }).select('+password');
        if (user && (await user.comparePassword(password))) {
          const token = signToken({ id: user._id, email: user.email, role: user.role });
          const userObj = user.toObject();
          delete userObj.password;

          return res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            token,
            user: userObj,
          });
        }
      } catch (err) {
        console.warn('[Auth] DB login query failed, falling back to in-memory store:', err.message);
      }
    }

    // In-memory fallback
    const memUser = inMemoryUsers.find((u) => u.email === emailLower);
    if (!memUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
      });
    }

    const isMatch = await bcrypt.compare(password, memUser.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
      });
    }

    const token = signToken({ id: memUser._id, email: memUser.email, role: memUser.role });
    const { password: _, ...userWithoutPassword } = memUser;

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged in user profile
 * @route   GET /api/auth/me
 * @access  Private (Protected)
 */
const getMe = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      try {
        const user = await User.findById(req.user.id);
        if (user) {
          return res.status(200).json({ success: true, user });
        }
      } catch (err) {
        // Fallback below
      }
    }

    const memUser = inMemoryUsers.find((u) => u._id === req.user.id.toString());
    if (memUser) {
      const { password: _, ...userWithoutPassword } = memUser;
      return res.status(200).json({ success: true, user: userWithoutPassword });
    }

    // If request user exists from token
    if (req.user) {
      return res.status(200).json({ success: true, user: req.user });
    }

    return res.status(404).json({ success: false, message: 'User profile not found' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
