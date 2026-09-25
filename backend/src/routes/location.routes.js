const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');

// @route   GET /api/location/fleet
// @desc    Get real-time coordinates & telematics for all fleet vehicles
// @access  Public / Admin / Employee
router.get('/fleet', (req, res, next) => locationController.getAllFleetLocations(req, res, next));

// @route   GET /api/location/vehicle/:vehicleId
// @desc    Get latest telematics location for a specific vehicle
// @access  Public / Customer / Admin
router.get('/vehicle/:vehicleId', (req, res, next) => locationController.getVehicleLocation(req, res, next));

// @route   GET /api/location/vehicle/:vehicleId/history
// @desc    Get breadcrumb path history for a vehicle
// @access  Admin / Fleet Manager
router.get('/vehicle/:vehicleId/history', (req, res, next) => locationController.getVehicleLocationHistory(req, res, next));

// @route   POST /api/location/update
// @desc    Ingest vehicle telematics coordinate update
// @access  Telematics Device / Fleet Admin
router.post('/update', (req, res, next) => locationController.updateVehicleLocation(req, res, next));

// @route   POST /api/location/simulate/:vehicleId
// @desc    Advance simulated vehicle movement tick
// @access  Admin / Fleet Manager
router.post('/simulate/:vehicleId', (req, res, next) => locationController.simulateMovement(req, res, next));

module.exports = router;
