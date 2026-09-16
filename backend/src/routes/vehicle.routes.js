const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle.controller');

// Fleet Vehicle CRUD Routes
router.post('/', (req, res, next) => vehicleController.createVehicle(req, res, next));
router.get('/', (req, res, next) => vehicleController.getVehicles(req, res, next));
router.get('/:id', (req, res, next) => vehicleController.getVehicleById(req, res, next));
router.put('/:id', (req, res, next) => vehicleController.updateVehicle(req, res, next));
router.patch('/:id/status', (req, res, next) => vehicleController.updateVehicleStatus(req, res, next));
router.patch('/:id/deactivate', (req, res, next) => vehicleController.toggleVehicleActive(req, res, next));
router.delete('/:id', (req, res, next) => vehicleController.deleteVehicle(req, res, next));

module.exports = router;
