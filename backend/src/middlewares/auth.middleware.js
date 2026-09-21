const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

// Protect routes - verify JWT token & attach user to request object
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, access token missing',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'dev_jwt_secret_key_12345';
    const decoded = jwt.verify(token, secret);

    let user = null;
    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findById(decoded.id).select('-password');
      } catch (err) {
        // Fallback below
      }
    }

    if (!user) {
      user = {
        _id: decoded.id,
        id: decoded.id,
        email: decoded.email,
        role: decoded.role || 'CUSTOMER',
      };
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[Protect Middleware Error]:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, invalid or expired token',
    });
  }
};

// Grant access to specific roles (RBAC)
const authorize = (...roles) => {
  const normalizedRoles = roles.map((r) => r.toUpperCase());
  return (req, res, next) => {
    if (!req.user || !normalizedRoles.includes(req.user.role.toUpperCase())) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user?.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
