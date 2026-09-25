const { LocationService } = require('../services/location.service');

class LocationController {
  async getAllFleetLocations(req, res, next) {
    try {
      const locations = await LocationService.getAllFleetLocations();
      return res.status(200).json({
        success: true,
        count: locations.length,
        data: locations,
      });
    } catch (error) {
      next(error);
    }
  }

  async getVehicleLocation(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const location = await LocationService.getLatestVehicleLocation(vehicleId);
      return res.status(200).json({
        success: true,
        data: location,
      });
    } catch (error) {
      next(error);
    }
  }

  async getVehicleLocationHistory(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const { limit } = req.query;
      const history = await LocationService.getVehicleLocationHistory(vehicleId, limit);
      return res.status(200).json({
        success: true,
        count: history.length,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateVehicleLocation(req, res, next) {
    try {
      const { vehicleId, latitude, longitude, speed, heading, status, batteryLevel, fuelLevel, odometer, address } = req.body;
      const result = await LocationService.recordLocation(vehicleId, {
        latitude,
        longitude,
        speed,
        heading,
        status,
        batteryLevel,
        fuelLevel,
        odometer,
        address,
      });
      return res.status(201).json({
        success: true,
        message: 'Vehicle telematics recorded successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async simulateMovement(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const { stepSize } = req.body;
      const updatedTelemetry = await LocationService.simulateVehicleMovement(vehicleId, { stepSize });
      return res.status(200).json({
        success: true,
        message: 'Simulated vehicle movement tick recorded',
        data: updatedTelemetry,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LocationController();
