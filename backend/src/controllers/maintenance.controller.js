const maintenanceService = require('../services/maintenance.service');
const {
  SERVICE_TYPES,
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_STATUSES,
} = require('../models/Maintenance');

class MaintenanceController {
  // POST /api/maintenance
  async createMaintenance(req, res, next) {
    try {
      const record = await maintenanceService.createMaintenance(req.body, req.user || {});
      return res.status(201).json({
        success: true,
        message: `Maintenance work order '${record.maintenanceNumber}' created successfully`,
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/maintenance
  async getAllMaintenance(req, res, next) {
    try {
      const result = await maintenanceService.getAllMaintenance(req.query);
      return res.status(200).json({
        success: true,
        data: result.maintenance,
        total: result.total,
        page: result.page,
        limit: result.limit,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/maintenance/stats
  async getMaintenanceStats(req, res, next) {
    try {
      const stats = await maintenanceService.getMaintenanceStats();
      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/maintenance/meta
  async getMaintenanceMeta(req, res, next) {
    try {
      return res.status(200).json({
        success: true,
        data: {
          serviceTypes: SERVICE_TYPES,
          priorities: MAINTENANCE_PRIORITIES,
          statuses: MAINTENANCE_STATUSES,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/maintenance/:id
  async getMaintenanceById(req, res, next) {
    try {
      const record = await maintenanceService.getMaintenanceById(req.params.id);
      return res.status(200).json({
        success: true,
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/maintenance/:id
  async updateMaintenance(req, res, next) {
    try {
      const updated = await maintenanceService.updateMaintenance(req.params.id, req.body, req.user || {});
      return res.status(200).json({
        success: true,
        message: `Maintenance record updated successfully (${updated.status})`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/maintenance/:id
  async deleteMaintenance(req, res, next) {
    try {
      const result = await maintenanceService.deleteMaintenance(req.params.id);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/maintenance/vehicle/:vehicleId
  async getVehicleMaintenanceHistory(req, res, next) {
    try {
      const result = await maintenanceService.getAllMaintenance({ vehicleId: req.params.vehicleId });
      return res.status(200).json({
        success: true,
        data: result.maintenance,
        total: result.total,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MaintenanceController();
