const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');

let vehicleRoutes;
try {
  vehicleRoutes = require('./routes/vehicle.routes');
} catch (e) {
  vehicleRoutes = null;
}

let reservationRoutes;
try {
  reservationRoutes = require('./routes/reservation.routes');
} catch (e) {
  reservationRoutes = null;
}

let maintenanceRoutes;
try {
  maintenanceRoutes = require('./routes/maintenance.routes');
} catch (e) {
  maintenanceRoutes = null;
}

let rentalRoutes;
try {
  rentalRoutes = require('./routes/rental.routes');
} catch (e) {
  rentalRoutes = null;
}

let dashboardRoutes;
try {
  dashboardRoutes = require('./routes/dashboard.routes');
} catch (e) {
  dashboardRoutes = null;
}

let invoiceRoutes;
try {
  invoiceRoutes = require('./routes/invoice.routes');
} catch (e) {
  invoiceRoutes = null;
}

let pricingRoutes;
try {
  pricingRoutes = require('./routes/pricing.routes');
} catch (e) {
  pricingRoutes = null;
}

const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base Welcome Route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Vehicomp API - Vehicle Rental & Fleet Management System',
    healthCheck: '/api/health',
    authCheck: '/api/auth/me',
  });
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
if (vehicleRoutes) {
  app.use('/api/vehicles', vehicleRoutes);
}
if (reservationRoutes) {
  app.use('/api/reservations', reservationRoutes);
}
if (maintenanceRoutes) {
  app.use('/api/maintenance', maintenanceRoutes);
}
if (rentalRoutes) {
  app.use('/api/rentals', rentalRoutes);
}
if (dashboardRoutes) {
  app.use('/api/dashboard', dashboardRoutes);
}
if (invoiceRoutes) {
  app.use('/api/invoices', invoiceRoutes);
}
if (pricingRoutes) {
  app.use('/api/pricing', pricingRoutes);
}

// Error handling middlewares
if (typeof notFoundHandler === 'function') {
  app.use(notFoundHandler);
} else {
  app.use((req, res) => {
    res.status(404).json({ status: 'error', message: `Cannot find ${req.originalUrl} on server` });
  });
}

if (typeof errorHandler === 'function') {
  app.use(errorHandler);
} else {
  app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(err.status || 500).json({ status: 'error', message: err.message || 'Internal Server Error' });
  });
}

module.exports = app;
