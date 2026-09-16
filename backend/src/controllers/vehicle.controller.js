const vehicleService = require('../services/vehicle.service');

class VehicleController {
  // POST /api/vehicles
  async createVehicle(req, res, next) {
    try {
      const vehicle = await vehicleService.createVehicle(req.body);
      return res.status(201).json({
        success: true,
        message: 'Vehicle added successfully to fleet',
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/vehicles
  async getVehicles(req, res, next) {
    try {
      const result = await vehicleService.getVehicles(req.query);
      return res.status(200).json({
        success: true,
        count: result.vehicles.length,
        pagination: result.pagination,
        data: result.vehicles,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/vehicles/:id
  async getVehicleById(req, res, next) {
    try {
      const vehicle = await vehicleService.getVehicleById(req.params.id);
      return res.status(200).json({
        success: true,
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/vehicles/:id
  async updateVehicle(req, res, next) {
    try {
      const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Vehicle updated successfully',
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/vehicles/:id/status
  async updateVehicleStatus(req, res, next) {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status field is required in request body',
        });
      }
      const vehicle = await vehicleService.updateVehicleStatus(req.params.id, status);
      return res.status(200).json({
        success: true,
        message: `Vehicle status updated to ${status}`,
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/vehicles/:id/deactivate
  async toggleVehicleActive(req, res, next) {
    try {
      const { isActive } = req.body;
      const vehicle = await vehicleService.toggleVehicleActive(req.params.id, isActive);
      return res.status(200).json({
        success: true,
        message: `Vehicle ${vehicle.isActive ? 'activated' : 'deactivated'} successfully`,
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/vehicles/:id
  async deleteVehicle(req, res, next) {
    try {
      const result = await vehicleService.deleteVehicle(req.params.id);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: { vehicleId: result.vehicleId },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VehicleController();
