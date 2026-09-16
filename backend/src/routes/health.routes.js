const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

let getHealthStatus;
try {
  getHealthStatus = require('../controllers/health.controller').getHealthStatus;
} catch (e) {
  getHealthStatus = null;
}

router.get('/', (req, res, next) => {
  if (typeof getHealthStatus === 'function') {
    return getHealthStatus(req, res, next);
  }

  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'success',
    message: 'Vehicle Rental System API is running',
    timestamp: new Date().toISOString(),
    services: {
      api: 'healthy',
      database: dbStatus,
    },
    module: 'Customer & Rental Management',
  });
});

module.exports = router;
