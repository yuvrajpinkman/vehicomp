const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

/**
 * @route   GET /api/health
 * @desc    Health check endpoint for API and Database status
 * @access  Public
 */
router.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.status(200).json({
    status: 'success',
    message: 'Vehicle Rental System API is running',
    timestamp: new Date().toISOString(),
    services: {
      api: 'healthy',
      database: dbStatus
    },
    module: 'Customer & Rental Management'
  });
});

module.exports = router;
