const mongoose = require('mongoose');

const getDbStateString = (state) => {
  switch (state) {
    case 0: return 'disconnected';
    case 1: return 'connected';
    case 2: return 'connecting';
    case 3: return 'disconnecting';
    default: return 'unknown';
  }
};

const getHealthStatus = (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = getDbStateString(dbState);

  return res.status(200).json({
    status: 'ok',
    service: 'vehicomp-fleet-admin-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus,
      readyState: dbState,
    },
  });
};

module.exports = {
  getHealthStatus,
};
