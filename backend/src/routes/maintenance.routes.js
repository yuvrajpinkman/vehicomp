const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenance.controller');

// Maintenance Routes
router.post('/', (req, res, next) => maintenanceController.createMaintenance(req, res, next));
router.get('/', (req, res, next) => maintenanceController.getAllMaintenance(req, res, next));
router.get('/stats', (req, res, next) => maintenanceController.getMaintenanceStats(req, res, next));
router.get('/meta', (req, res, next) => maintenanceController.getMaintenanceMeta(req, res, next));
router.get('/vehicle/:vehicleId', (req, res, next) => maintenanceController.getVehicleMaintenanceHistory(req, res, next));
router.get('/:id', (req, res, next) => maintenanceController.getMaintenanceById(req, res, next));
router.put('/:id', (req, res, next) => maintenanceController.updateMaintenance(req, res, next));
router.patch('/:id/status', (req, res, next) => maintenanceController.updateMaintenance(req, res, next));
router.delete('/:id', (req, res, next) => maintenanceController.deleteMaintenance(req, res, next));

module.exports = router;
