const { Vehicle, VEHICLE_STATUSES, VEHICLE_TYPES, FUEL_TYPES } = require('../models/Vehicle');

class VehicleService {
  /**
   * Create a new vehicle in the fleet
   */
  async createVehicle(data) {
    // Check if registration number already exists
    const existing = await Vehicle.findOne({
      registrationNumber: data.registrationNumber.toUpperCase().trim(),
      isDeleted: false,
    });

    if (existing) {
      const error = new Error(`Vehicle with registration number ${data.registrationNumber.toUpperCase()} already exists.`);
      error.statusCode = 409;
      throw error;
    }

    const vehicle = new Vehicle(data);
    return await vehicle.save();
  }

  /**
   * Get all vehicles with optional filters, search, and pagination
   */
  async getVehicles(query = {}) {
    const {
      status,
      vehicleType,
      fuelType,
      city,
      condition,
      minPrice,
      maxPrice,
      search,
      isActive,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;

    const filter = { isDeleted: false };

    if (status) {
      filter.status = status.toUpperCase();
    }

    if (vehicleType) {
      filter.vehicleType = vehicleType.toUpperCase();
    }

    if (fuelType) {
      filter.fuelType = fuelType.toUpperCase();
    }

    if (condition) {
      filter.condition = condition.toUpperCase();
    }

    if (city) {
      filter['location.city'] = new RegExp(city.trim(), 'i');
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true' || isActive === true;
    }

    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { make: searchRegex },
        { model: searchRegex },
        { registrationNumber: searchRegex },
        { 'location.city': searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [vehicles, total] = await Promise.all([
      Vehicle.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limitNum),
      Vehicle.countDocuments(filter),
    ]);

    return {
      vehicles,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Retrieve a single vehicle by ID
   */
  async getVehicleById(id) {
    const vehicle = await Vehicle.findOne({ _id: id, isDeleted: false });
    if (!vehicle) {
      const error = new Error('Vehicle not found');
      error.statusCode = 404;
      throw error;
    }
    return vehicle;
  }

  /**
   * Update vehicle details
   */
  async updateVehicle(id, updateData) {
    // If registration number is being updated, verify no conflict
    if (updateData.registrationNumber) {
      const regUpper = updateData.registrationNumber.toUpperCase().trim();
      const conflict = await Vehicle.findOne({
        _id: { $ne: id },
        registrationNumber: regUpper,
        isDeleted: false,
      });

      if (conflict) {
        const error = new Error(`Vehicle with registration number ${regUpper} already exists.`);
        error.statusCode = 409;
        throw error;
      }
      updateData.registrationNumber = regUpper;
    }

    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      const error = new Error('Vehicle not found');
      error.statusCode = 404;
      throw error;
    }

    return vehicle;
  }

  /**
   * Update vehicle status
   */
  async updateVehicleStatus(id, newStatus) {
    const statusUpper = newStatus.toUpperCase();
    if (!VEHICLE_STATUSES.includes(statusUpper)) {
      const error = new Error(`Invalid status: ${newStatus}. Allowed values: ${VEHICLE_STATUSES.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { status: statusUpper } },
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      const error = new Error('Vehicle not found');
      error.statusCode = 404;
      throw error;
    }

    return vehicle;
  }

  /**
   * Toggle vehicle active / inactive state (deactivate vehicle)
   */
  async toggleVehicleActive(id, isActive) {
    const vehicle = await Vehicle.findOne({ _id: id, isDeleted: false });
    if (!vehicle) {
      const error = new Error('Vehicle not found');
      error.statusCode = 404;
      throw error;
    }

    vehicle.isActive = isActive !== undefined ? isActive : !vehicle.isActive;
    return await vehicle.save();
  }

  /**
   * Soft delete a vehicle
   */
  async deleteVehicle(id) {
    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true, isActive: false } },
      { new: true }
    );

    if (!vehicle) {
      const error = new Error('Vehicle not found');
      error.statusCode = 404;
      throw error;
    }

    return { message: 'Vehicle deleted successfully', vehicleId: id };
  }
}

module.exports = new VehicleService();
