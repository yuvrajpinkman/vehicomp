const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health.routes');
const vehicleRoutes = require('./routes/vehicle.routes');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base Route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Vehicomp API - Vehicle Rental & Fleet Management System',
    healthCheck: '/api/health',
  });
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/vehicles', vehicleRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
