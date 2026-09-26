const mongoose = require('mongoose');
const { Vehicle, VEHICLE_STATUSES, VEHICLE_TYPES, FUEL_TYPES } = require('../models/Vehicle');

// In-memory fallback vehicle store for when MongoDB Atlas IP is not whitelisted or DB is disconnected
let inMemoryVehicles = [
  {
    _id: '65f1a2b3c4d5e6f7a8b9c001',
    registrationNumber: 'TS09-EV-1001',
    make: 'Hyundai',
    model: 'Creta SX',
    year: 2024,
    vehicleType: 'SUV',
    fuelType: 'PETROL',
    pricePerDay: 2800,
    condition: 'EXCELLENT',
    status: 'AVAILABLE',
    location: { city: 'Hyderabad', address: 'Hitec City, Madhapur' },
    seatingCapacity: 5,
    mileage: 12500,
    features: ['Sunroof', 'Touchscreen Infotainment', 'Rear Camera', 'Wireless Charger'],
    isActive: true,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c002',
    registrationNumber: 'KA01-MH-2002',
    make: 'Honda',
    model: 'City ZX',
    year: 2023,
    vehicleType: 'SEDAN',
    fuelType: 'PETROL',
    pricePerDay: 2400,
    condition: 'EXCELLENT',
    status: 'AVAILABLE',
    location: { city: 'Bengaluru', address: 'Indiranagar 100ft Rd' },
    seatingCapacity: 5,
    mileage: 18400,
    features: ['Leather Seats', 'Automatic Transmission', 'ADAS Safety'],
    isActive: true,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c003',
    registrationNumber: 'MH02-EV-3003',
    make: 'Tata',
    model: 'Nexon EV Max',
    year: 2024,
    vehicleType: 'ELECTRIC',
    fuelType: 'ELECTRIC',
    pricePerDay: 2200,
    condition: 'EXCELLENT',
    status: 'AVAILABLE',
    location: { city: 'Mumbai', address: 'Bandra West' },
    seatingCapacity: 5,
    mileage: 8200,
    features: ['Fast Charging', 'Ventilated Seats', 'Digital Cluster'],
    isActive: true,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c004',
    registrationNumber: 'DL01-LUX-4004',
    make: 'BMW',
    model: '5 Series 530i',
    year: 2024,
    vehicleType: 'LUXURY',
    fuelType: 'PETROL',
    pricePerDay: 6500,
    condition: 'EXCELLENT',
    status: 'RESERVED',
    location: { city: 'Delhi', address: 'Connaught Place' },
    seatingCapacity: 5,
    mileage: 5100,
    features: ['Harman Kardon Sound', 'Heated Seats', 'Gesture Control'],
    isActive: true,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c005',
    registrationNumber: 'MH12-HB-5005',
    make: 'Maruti Suzuki',
    model: 'Swift ZXi',
    year: 2023,
    vehicleType: 'HATCHBACK',
    fuelType: 'PETROL',
    pricePerDay: 1500,
    condition: 'GOOD',
    status: 'AVAILABLE',
    location: { city: 'Pune', address: 'Viman Nagar' },
    seatingCapacity: 5,
    mileage: 22000,
    features: ['Alloy Wheels', 'Push Button Start'],
    isActive: true,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

class VehicleService {
  isDbConnected() {
    return mongoose.connection.readyState === 1;
  }

  /**
   * Create a new vehicle in the fleet
   */
  async createVehicle(data) {
    if (!data.vehicleType && data.category) {
      data.vehicleType = data.category;
    }
    if (!data.vehicleType) {
      data.vehicleType = 'SEDAN';
    }
    if (typeof data.location === 'string') {
      data.location = { city: data.location };
    } else if (!data.location || !data.location.city) {
      data.location = { city: data.location?.city || 'Pune', address: data.location?.address || '' };
    }

    if (this.isDbConnected()) {
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

    // In-Memory Fallback
    const regUpper = data.registrationNumber.toUpperCase().trim();
    const existing = inMemoryVehicles.find((v) => v.registrationNumber === regUpper && !v.isDeleted);
    if (existing) {
      const error = new Error(`Vehicle with registration number ${regUpper} already exists.`);
      error.statusCode = 409;
      throw error;
    }

    const newVehicle = {
      _id: new mongoose.Types.ObjectId().toString(),
      registrationNumber: regUpper,
      make: data.make,
      model: data.model,
      year: Number(data.year),
      vehicleType: data.vehicleType ? data.vehicleType.toUpperCase() : 'SEDAN',
      fuelType: data.fuelType ? data.fuelType.toUpperCase() : 'PETROL',
      pricePerDay: Number(data.pricePerDay),
      condition: data.condition ? data.condition.toUpperCase() : 'GOOD',
      status: data.status ? data.status.toUpperCase() : 'AVAILABLE',
      location: data.location || { city: 'Hyderabad', address: '' },
      seatingCapacity: Number(data.seatingCapacity) || 5,
      features: data.features || [],
      isActive: data.isActive !== undefined ? data.isActive : true,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryVehicles.unshift(newVehicle);
    return newVehicle;
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
    } = query;

    if (this.isDbConnected()) {
      try {
        const filter = { isDeleted: false };
        if (status) filter.status = status.toUpperCase();
        if (vehicleType) filter.vehicleType = vehicleType.toUpperCase();
        if (fuelType) filter.fuelType = fuelType.toUpperCase();
        if (condition) filter.condition = condition.toUpperCase();
        if (city) filter['location.city'] = new RegExp(city.trim(), 'i');
        if (isActive !== undefined) filter.isActive = isActive === 'true' || isActive === true;
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

        const [vehicles, total] = await Promise.all([
          Vehicle.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
          Vehicle.countDocuments(filter),
        ]);

        return {
          vehicles,
          pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
        };
      } catch (err) {
        console.warn('[VehicleService] Mongoose query failed. Falling back to in-memory vehicle store:', err.message);
      }
    }

    // In-Memory Fallback
    let filtered = inMemoryVehicles.filter((v) => !v.isDeleted);

    if (status && status !== 'ALL') {
      filtered = filtered.filter((v) => v.status === status.toUpperCase());
    }
    if (vehicleType && vehicleType !== 'ALL') {
      filtered = filtered.filter((v) => v.vehicleType === vehicleType.toUpperCase());
    }
    if (fuelType) {
      filtered = filtered.filter((v) => v.fuelType === fuelType.toUpperCase());
    }
    if (city) {
      filtered = filtered.filter((v) => v.location?.city?.toLowerCase().includes(city.toLowerCase()));
    }
    if (minPrice) {
      filtered = filtered.filter((v) => (v.pricePerDay || 0) >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter((v) => (v.pricePerDay || 0) <= Number(maxPrice));
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.make?.toLowerCase().includes(s) ||
          v.model?.toLowerCase().includes(s) ||
          v.registrationNumber?.toLowerCase().includes(s) ||
          v.location?.city?.toLowerCase().includes(s)
      );
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    return {
      vehicles: filtered,
      pagination: {
        total: filtered.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(filtered.length / limitNum),
      },
    };
  }

  /**
   * Retrieve a single vehicle by ID
   */
  async getVehicleById(id) {
    if (this.isDbConnected()) {
      try {
        const vehicle = await Vehicle.findOne({ _id: id, isDeleted: false });
        if (vehicle) return vehicle;
      } catch (err) {
        // Fallback below
      }
    }

    const vehicle = inMemoryVehicles.find((v) => v._id === id.toString() && !v.isDeleted);
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
    if (this.isDbConnected()) {
      try {
        const vehicle = await Vehicle.findOneAndUpdate(
          { _id: id, isDeleted: false },
          { $set: updateData },
          { new: true, runValidators: true }
        );
        if (vehicle) return vehicle;
      } catch (err) {
        // Fallback below
      }
    }

    const index = inMemoryVehicles.findIndex((v) => v._id === id.toString() && !v.isDeleted);
    if (index === -1) {
      const error = new Error('Vehicle not found');
      error.statusCode = 404;
      throw error;
    }

    inMemoryVehicles[index] = {
      ...inMemoryVehicles[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    return inMemoryVehicles[index];
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

    if (this.isDbConnected()) {
      try {
        const vehicle = await Vehicle.findOneAndUpdate(
          { _id: id, isDeleted: false },
          { $set: { status: statusUpper } },
          { new: true, runValidators: true }
        );
        if (vehicle) return vehicle;
      } catch (err) {
        // Fallback below
      }
    }

    const index = inMemoryVehicles.findIndex((v) => v._id === id.toString() && !v.isDeleted);
    if (index === -1) {
      const error = new Error('Vehicle not found');
      error.statusCode = 404;
      throw error;
    }

    inMemoryVehicles[index].status = statusUpper;
    inMemoryVehicles[index].updatedAt = new Date().toISOString();
    return inMemoryVehicles[index];
  }

  /**
   * Toggle vehicle active / inactive state
   */
  async toggleVehicleActive(id, isActive) {
    if (this.isDbConnected()) {
      try {
        const vehicle = await Vehicle.findOne({ _id: id, isDeleted: false });
        if (vehicle) {
          vehicle.isActive = isActive !== undefined ? isActive : !vehicle.isActive;
          return await vehicle.save();
        }
      } catch (err) {
        // Fallback below
      }
    }

    const vehicle = inMemoryVehicles.find((v) => v._id === id.toString() && !v.isDeleted);
    if (!vehicle) {
      const error = new Error('Vehicle not found');
      error.statusCode = 404;
      throw error;
    }

    vehicle.isActive = isActive !== undefined ? isActive : !vehicle.isActive;
    vehicle.updatedAt = new Date().toISOString();
    return vehicle;
  }

  /**
   * Soft delete a vehicle
   */
  async deleteVehicle(id) {
    if (this.isDbConnected()) {
      try {
        const vehicle = await Vehicle.findOneAndUpdate(
          { _id: id, isDeleted: false },
          { $set: { isDeleted: true, isActive: false } },
          { new: true }
        );
        if (vehicle) return { message: 'Vehicle deleted successfully', vehicleId: id };
      } catch (err) {
        // Fallback below
      }
    }

    const index = inMemoryVehicles.findIndex((v) => v._id === id.toString() && !v.isDeleted);
    if (index === -1) {
      const error = new Error('Vehicle not found');
      error.statusCode = 404;
      throw error;
    }

    inMemoryVehicles[index].isDeleted = true;
    inMemoryVehicles[index].isActive = false;
    return { message: 'Vehicle deleted successfully', vehicleId: id };
  }

  /**
   * Check vehicle availability for specified dates and compute estimated price
   */
  async checkVehicleAvailability(id, startDate, endDate) {
    const vehicle = await this.getVehicleById(id);
    if (!vehicle) {
      const error = new Error('Vehicle not found');
      error.statusCode = 404;
      throw error;
    }

    if (!vehicle.isActive) {
      return {
        vehicleId: id,
        available: false,
        reason: 'Vehicle is currently inactive in system',
        vehicle,
      };
    }

    if (vehicle.status === 'MAINTENANCE' || vehicle.status === 'DAMAGED') {
      return {
        vehicleId: id,
        available: false,
        reason: `Vehicle is currently under ${vehicle.status.toLowerCase()}`,
        vehicle,
      };
    }

    let days = 1;
    const pricePerDay = vehicle.pricePerDay || 0;
    let estimatedTotal = pricePerDay;
    let conflict = null;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        const error = new Error('Invalid start or end date format');
        error.statusCode = 400;
        throw error;
      }

      if (start >= end) {
        const error = new Error('End date must be strictly after start date');
        error.statusCode = 400;
        throw error;
      }

      const diffTime = Math.abs(end - start);
      days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      estimatedTotal = days * pricePerDay;

      try {
        const reservationService = require('./reservation.service');
        conflict = await reservationService.checkVehicleConflict(id, start, end);
      } catch (err) {
        console.warn('[VehicleService] Reservation conflict check warning:', err.message);
      }
    }

    let isAvailable = vehicle.status === 'AVAILABLE';
    let availabilityReason = isAvailable
      ? 'Vehicle is available for reservation'
      : `Vehicle status is currently ${vehicle.status}`;

    if (conflict) {
      isAvailable = false;
      const cStartStr = new Date(conflict.startDate).toISOString().split('T')[0];
      const cEndStr = new Date(conflict.endDate).toISOString().split('T')[0];
      availabilityReason = `Vehicle is already reserved from ${cStartStr} to ${cEndStr}`;
    }

    return {
      vehicleId: id,
      available: isAvailable,
      reason: availabilityReason,
      startDate: startDate || null,
      endDate: endDate || null,
      rentalDays: days,
      pricePerDay,
      estimatedTotal,
      conflictingReservation: conflict || null,
      vehicle,
    };
  }
}

module.exports = new VehicleService();
