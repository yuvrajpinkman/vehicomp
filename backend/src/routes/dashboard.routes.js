const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

// Fleet Dashboard Routes
router.get('/stats', (req, res, next) => dashboardController.getDashboardStats(req, res, next));
router.get('/revenue-trend', (req, res, next) => dashboardController.getRevenueTrend(req, res, next));
router.get('/performance', (req, res, next) => dashboardController.getVehiclePerformance(req, res, next));

module.exports = router;
