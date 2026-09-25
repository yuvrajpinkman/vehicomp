const { Vehicle } = require('../models/Vehicle');
const { LocationLog } = require('../models/Location');

class LocationService {
  /**
   * Records a new telematics location ping for a vehicle and updates vehicle coordinates.
   */
  async recordLocation(vehicleId, telemetry = {}) {
    const {
      latitude,
      longitude,
      speed = 0,
      heading = 0,
      status = 'PARKED',
      batteryLevel = 100,
      fuelLevel = 85,
      odometer = 0,
      address = '',
    } = telemetry;

    if (latitude === undefined || longitude === undefined) {
      const error = new Error('Latitude and Longitude are required');
      error.statusCode = 400;
      throw error;
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      const error = new Error('Latitude must be a valid number between -90 and 90');
      error.statusCode = 400;
      throw error;
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      const error = new Error('Longitude must be a valid number between -180 and 180');
      error.statusCode = 400;
      throw error;
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      const error = new Error('Vehicle not found');
      error.statusCode = 404;
      throw error;
    }

    // Save history log
    const locationEntry = await LocationLog.create({
      vehicle: vehicleId,
      latitude: lat,
      longitude: lng,
      speed: Number(speed) || 0,
      heading: Number(heading) || 0,
      status,
      batteryLevel: Number(batteryLevel),
      fuelLevel: Number(fuelLevel),
      odometer: Number(odometer),
      address: address || vehicle.location?.address || `${vehicle.location?.city || 'Hyderabad'} Sector`,
      timestamp: new Date(),
    });

    // Update current vehicle coordinates
    if (!vehicle.location) {
      vehicle.location = { city: 'Hyderabad', coordinates: {} };
    }
    vehicle.location.coordinates = {
      latitude: lat,
      longitude: lng,
    };
    await vehicle.save();

    return locationEntry;
  }

  /**
   * Retrieves the current / latest telemetry location for a specific vehicle.
   */
  async getLatestVehicleLocation(vehicleId) {
    const vehicle = await Vehicle.findById(vehicleId).lean();
    if (!vehicle) {
      const error = new Error('Vehicle not found');
      error.statusCode = 404;
      throw error;
    }

    const latestLog = await LocationLog.findOne({ vehicle: vehicleId })
      .sort({ timestamp: -1 })
      .lean();

    if (latestLog) {
      return {
        ...latestLog,
        vehicleDetails: {
          make: vehicle.make,
          model: vehicle.model,
          registrationNumber: vehicle.registrationNumber,
          vehicleType: vehicle.vehicleType,
          status: vehicle.status,
        },
      };
    }

    // Default to vehicle schema coordinates if no log entry exists yet
    const lat = vehicle.location?.coordinates?.latitude || 17.3850;
    const lng = vehicle.location?.coordinates?.longitude || 78.4867;

    return {
      vehicle: vehicleId,
      latitude: lat,
      longitude: lng,
      speed: vehicle.status === 'RENTED' ? 42 : 0,
      heading: 90,
      status: vehicle.status === 'RENTED' ? 'MOVING' : vehicle.status === 'MAINTENANCE' ? 'MAINTENANCE' : 'PARKED',
      batteryLevel: 95,
      fuelLevel: 80,
      odometer: vehicle.mileage || 12000,
      address: vehicle.location?.address || vehicle.location?.city || 'Hyderabad Depot',
      timestamp: new Date(),
      vehicleDetails: {
        make: vehicle.make,
        model: vehicle.model,
        registrationNumber: vehicle.registrationNumber,
        vehicleType: vehicle.vehicleType,
        status: vehicle.status,
      },
    };
  }

  /**
   * Retrieves historical breadcrumb trail path for a vehicle.
   */
  async getVehicleLocationHistory(vehicleId, limit = 50) {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      const error = new Error('Vehicle not found');
      error.statusCode = 404;
      throw error;
    }

    const logs = await LocationLog.find({ vehicle: vehicleId })
      .sort({ timestamp: 1 })
      .limit(Number(limit) || 50)
      .lean();

    return logs;
  }

  /**
   * Retrieves real-time location snapshot for all active fleet vehicles.
   */
  async getAllFleetLocations() {
    const vehicles = await Vehicle.find({ isActive: true, isDeleted: false }).lean();

    const fleetLocations = await Promise.all(
      vehicles.map(async (v) => {
        const latest = await LocationLog.findOne({ vehicle: v._id })
          .sort({ timestamp: -1 })
          .lean();

        const lat = latest?.latitude ?? v.location?.coordinates?.latitude ?? 17.3850;
        const lng = latest?.longitude ?? v.location?.coordinates?.longitude ?? 78.4867;
        const speed = latest?.speed ?? (v.status === 'RENTED' ? 38 : 0);
        const heading = latest?.heading ?? 0;
        const status =
          latest?.status ??
          (v.status === 'RENTED' ? 'MOVING' : v.status === 'MAINTENANCE' ? 'MAINTENANCE' : 'PARKED');

        return {
          vehicleId: v._id,
          registrationNumber: v.registrationNumber,
          make: v.make,
          model: v.model,
          year: v.year,
          vehicleType: v.vehicleType,
          fuelType: v.fuelType,
          fleetStatus: v.status,
          latitude: lat,
          longitude: lng,
          speed,
          heading,
          telemetryStatus: status,
          batteryLevel: latest?.batteryLevel ?? 92,
          fuelLevel: latest?.fuelLevel ?? 78,
          address: latest?.address || v.location?.address || v.location?.city || 'Fleet Depot',
          timestamp: latest?.timestamp || v.updatedAt || new Date(),
        };
      })
    );

    return fleetLocations;
  }

  /**
   * Advances vehicle coordinates along a simulated urban trajectory.
   */
  async simulateVehicleMovement(vehicleId, options = {}) {
    const currentLoc = await this.getLatestVehicleLocation(vehicleId);
    const vehicle = await Vehicle.findById(vehicleId);

    // Realistic urban coordinate shift: ~0.001 - 0.0025 deg (~100m to 250m)
    const angleRad = ((currentLoc.heading || 45) + (Math.random() * 20 - 10)) * (Math.PI / 180);
    const step = options.stepSize || 0.0018;

    const newLat = Math.round((currentLoc.latitude + Math.cos(angleRad) * step) * 1000000) / 1000000;
    const newLng = Math.round((currentLoc.longitude + Math.sin(angleRad) * step) * 1000000) / 1000000;
    const newHeading = Math.round(((currentLoc.heading || 0) + (Math.random() * 30 - 15) + 360) % 360);
    const newSpeed = Math.floor(Math.random() * 25) + 35; // 35 - 60 km/h

    return await this.recordLocation(vehicleId, {
      latitude: newLat,
      longitude: newLng,
      speed: newSpeed,
      heading: newHeading,
      status: 'MOVING',
      batteryLevel: Math.max(10, (currentLoc.batteryLevel || 100) - 1),
      fuelLevel: Math.max(10, (currentLoc.fuelLevel || 85) - 1),
      odometer: (currentLoc.odometer || 10000) + 1,
      address: `In Transit — Sector ${Math.floor(Math.random() * 12) + 1}`,
    });
  }
}

module.exports = {
  LocationService: new LocationService(),
};
