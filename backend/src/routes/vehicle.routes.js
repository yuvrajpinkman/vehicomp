const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle.controller');

// Fleet & Customer Vehicle Routes
router.post('/', (req, res, next) => vehicleController.createVehicle(req, res, next));
router.get('/', (req, res, next) => vehicleController.getVehicles(req, res, next));
router.get('/lifecycle/rules', (req, res, next) => vehicleController.getLifecycleRules(req, res, next));
router.get('/:id/availability', (req, res, next) => vehicleController.checkVehicleAvailability(req, res, next));
router.get('/:id/history', (req, res, next) => vehicleController.getVehicleHistory(req, res, next));
router.post('/:id/transition', (req, res, next) => vehicleController.transitionStatus(req, res, next));
router.get('/:id', (req, res, next) => vehicleController.getVehicleById(req, res, next));
router.put('/:id', (req, res, next) => vehicleController.updateVehicle(req, res, next));
router.patch('/:id/status', (req, res, next) => vehicleController.updateVehicleStatus(req, res, next));
router.patch('/:id/deactivate', (req, res, next) => vehicleController.toggleVehicleActive(req, res, next));
router.delete('/:id', (req, res, next) => vehicleController.deleteVehicle(req, res, next));

module.exports = router;
