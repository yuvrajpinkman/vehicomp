const mongoose = require('mongoose');
const Rental = require('../models/Rental');
const Reservation = require('../models/Reservation');
const vehicleService = require('./vehicle.service');
const { lifecycleService } = require('./lifecycle.service');

// In-memory fallback rental store for offline / test environments
let inMemoryRentals = [];

class RentalService {
  /**
   * Helper to format/populate vehicle object
   */
  async _populateRental(rental) {
    if (!rental) return null;
    let vehicleData = rental.vehicle;
    let userData = rental.user;

    if (typeof vehicleData === 'string' || vehicleData instanceof mongoose.Types.ObjectId) {
      try {
        vehicleData = await vehicleService.getVehicleById(vehicleData);
      } catch (e) {
        // Keep original ID if lookup fails
      }
    }

    return {
      ...rental.toObject ? rental.toObject() : rental,
      vehicle: vehicleData,
      user: userData,
    };
  }

  /**
   * Start a new rental
   */
  async startRental(data, userId) {
    const { reservationId, vehicleId, expectedReturnDate, initialOdometer, notes } = data;

    if (!vehicleId) {
      const error = new Error('Vehicle ID is required to start a rental');
      error.statusCode = 400;
      throw error;
    }

    // Check vehicle existence
    const vehicle = await vehicleService.getVehicleById(vehicleId);
    if (!vehicle) {
      const error = new Error('Vehicle not found');
      error.statusCode = 404;
      throw error;
    }

    if (['RENTED', 'MAINTENANCE', 'DAMAGED'].includes(vehicle.status)) {
      const error = new Error(`Cannot rent vehicle. Current vehicle status is '${vehicle.status}'`);
      error.statusCode = 400;
      throw error;
    }

    let linkedReservation = null;
    let calculatedExpectedReturn = expectedReturnDate ? new Date(expectedReturnDate) : null;

    // Handle reservation link if provided
    if (reservationId) {
      if (mongoose.connection.readyState === 1) {
        try {
          linkedReservation = await Reservation.findById(reservationId);
        } catch (e) {
          // fallback to in-memory check if needed
        }
      }
      if (linkedReservation) {
        if (linkedReservation.status === 'CANCELLED') {
          const error = new Error('Cannot start rental for a cancelled reservation');
          error.statusCode = 400;
          throw error;
        }
        if (!calculatedExpectedReturn) {
          calculatedExpectedReturn = linkedReservation.endDate;
        }
        linkedReservation.status = 'COMPLETED';
        if (mongoose.connection.readyState === 1) {
          await linkedReservation.save();
        }
      }
    }

    if (!calculatedExpectedReturn || isNaN(calculatedExpectedReturn.getTime())) {
      // Default to 1 day from now if not specified
      calculatedExpectedReturn = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    const startDate = new Date();
    const startOdometer = Number(initialOdometer) >= 0 ? Number(initialOdometer) : (vehicle.mileage || 0);

    // Perform state transition RESERVED/AVAILABLE -> RENTED
    await lifecycleService.transitionVehicleStatus(vehicleId, 'RENTED', {
      changedBy: userId || 'Customer',
      reason: 'Vehicle picked up and rental commenced',
      notes: notes || '',
    });

    const rentalNumber = `RNT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const validUserId = (userId && mongoose.Types.ObjectId.isValid(userId.toString()))
      ? userId.toString()
      : new mongoose.Types.ObjectId().toString();

    const rentalPayload = {
      _id: new mongoose.Types.ObjectId().toString(),
      rentalNumber,
      reservation: reservationId || null,
      user: validUserId,
      vehicle: vehicle._id ? vehicle._id.toString() : vehicleId,
      startDate,
      expectedReturnDate: calculatedExpectedReturn,
      actualReturnDate: null,
      initialOdometer: startOdometer,
      returnOdometer: startOdometer,
      status: 'ACTIVE',
      dailyRate: vehicle.pricePerDay || 100,
      hourlyLateFeeRate: 15,
      lateHours: 0,
      lateFee: 0,
      notes: notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const newRental = new Rental(rentalPayload);
        const savedRental = await newRental.save();
        inMemoryRentals.push(savedRental.toObject());
        return await this._populateRental(savedRental);
      } catch (err) {
        console.warn('[RentalService] DB save failed, using in-memory fallback:', err.message);
      }
    }

    inMemoryRentals.push(rentalPayload);
    return await this._populateRental(rentalPayload);
  }

  /**
   * Get active rentals (optionally filtered by user)
   */
  async getActiveRentals(userId = null) {
    const now = new Date();

    if (mongoose.connection.readyState === 1) {
      try {
        const query = { status: { $in: ['ACTIVE', 'OVERDUE'] } };
        if (userId) query.user = userId;

        const rentals = await Rental.find(query).sort({ createdAt: -1 });

        // Update overdue status dynamically
        for (const rental of rentals) {
          if (rental.status === 'ACTIVE' && new Date(rental.expectedReturnDate) < now) {
            rental.status = 'OVERDUE';
            await rental.save();
          }
        }
        return await Promise.all(rentals.map((r) => this._populateRental(r)));
      } catch (err) {
        console.warn('[RentalService] DB query failed, using in-memory fallback:', err.message);
      }
    }

    // In-memory fallback
    const filtered = inMemoryRentals.filter((r) => {
      const matchUser = userId ? (r.user._id ? r.user._id.toString() : r.user.toString()) === userId.toString() : true;
      const matchStatus = ['ACTIVE', 'OVERDUE'].includes(r.status);
      return matchUser && matchStatus;
    });

    filtered.forEach((r) => {
      if (r.status === 'ACTIVE' && new Date(r.expectedReturnDate) < now) {
        r.status = 'OVERDUE';
      }
    });

    return await Promise.all(filtered.map((r) => this._populateRental(r)));
  }

  /**
   * Get user rental history
   */
  async getUserRentals(userId) {
    if (!userId) {
      const error = new Error('User ID is required');
      error.statusCode = 400;
      throw error;
    }

    const now = new Date();

    if (mongoose.connection.readyState === 1) {
      try {
        const rentals = await Rental.find({ user: userId }).sort({ createdAt: -1 });
        for (const rental of rentals) {
          if (rental.status === 'ACTIVE' && new Date(rental.expectedReturnDate) < now) {
            rental.status = 'OVERDUE';
            await rental.save();
          }
        }
        return await Promise.all(rentals.map((r) => this._populateRental(r)));
      } catch (err) {
        console.warn('[RentalService] DB query failed, using in-memory fallback:', err.message);
      }
    }

    const filtered = inMemoryRentals.filter(
      (r) => (r.user._id ? r.user._id.toString() : r.user.toString()) === userId.toString()
    );
    filtered.forEach((r) => {
      if (r.status === 'ACTIVE' && new Date(r.expectedReturnDate) < now) {
        r.status = 'OVERDUE';
      }
    });

    return await Promise.all(filtered.map((r) => this._populateRental(r)));
  }

  /**
   * Get single rental by ID
   */
  async getRentalById(rentalId) {
    if (mongoose.connection.readyState === 1) {
      try {
        const rental = await Rental.findById(rentalId);
        if (rental) return await this._populateRental(rental);
      } catch (err) {
        // Fall through to in-memory check
      }
    }

    const found = inMemoryRentals.find(
      (r) => r._id.toString() === rentalId.toString() || r.rentalNumber === rentalId
    );
    if (!found) return null;
    return await this._populateRental(found);
  }

  /**
   * Return a rental (complete lifecycle)
   */
  async returnRental(rentalId, data = {}, userId = 'System') {
    const { returnOdometer, actualReturnDate, notes } = data;

    let rental = null;

    if (mongoose.connection.readyState === 1) {
      try {
        rental = await Rental.findById(rentalId);
      } catch (err) {
        console.warn('[RentalService] DB query failed during return:', err.message);
      }
    }

    if (!rental) {
      rental = inMemoryRentals.find(
        (r) => r._id.toString() === rentalId.toString() || r.rentalNumber === rentalId
      );
    }

    if (!rental) {
      const error = new Error('Rental record not found');
      error.statusCode = 404;
      throw error;
    }

    if (rental.status === 'COMPLETED') {
      const error = new Error('Rental is already completed and returned');
      error.statusCode = 400;
      throw error;
    }

    if (rental.status === 'CANCELLED') {
      const error = new Error('Cannot return a cancelled rental');
      error.statusCode = 400;
      throw error;
    }

    const dropoffTime = actualReturnDate ? new Date(actualReturnDate) : new Date();
    const expectedTime = new Date(rental.expectedReturnDate);

    let lateHours = 0;
    let lateFee = 0;

    if (dropoffTime > expectedTime) {
      const diffMs = dropoffTime.getTime() - expectedTime.getTime();
      lateHours = Math.ceil(diffMs / (1000 * 60 * 60));
      const hourlyRate = rental.hourlyLateFeeRate || 15;
      lateFee = lateHours * hourlyRate;
    }

    const finalReturnOdometer =
      Number(returnOdometer) >= 0 ? Number(returnOdometer) : Number(rental.initialOdometer) + 50;

    if (finalReturnOdometer < rental.initialOdometer) {
      const error = new Error(
        `Return odometer (${finalReturnOdometer}) cannot be less than initial odometer (${rental.initialOdometer})`
      );
      error.statusCode = 400;
      throw error;
    }

    const vehicleId = rental.vehicle._id ? rental.vehicle._id.toString() : rental.vehicle.toString();

    // Perform state transition RENTED -> RETURNED
    await lifecycleService.transitionVehicleStatus(vehicleId, 'RETURNED', {
      changedBy: userId,
      reason: `Vehicle returned by customer. Mileage: ${finalReturnOdometer} km.`,
      notes: notes || '',
    });

    // Update vehicle odometer
    try {
      const vehicle = await vehicleService.getVehicleById(vehicleId);
      if (vehicle) {
        vehicle.mileage = finalReturnOdometer;
        if (typeof vehicle.save === 'function') {
          await vehicle.save();
        }
      }
    } catch (e) {
      console.warn('[RentalService] Vehicle mileage update warning:', e.message);
    }

    // Update rental record
    rental.actualReturnDate = dropoffTime;
    rental.returnOdometer = finalReturnOdometer;
    rental.lateHours = lateHours;
    rental.lateFee = lateFee;
    rental.status = 'COMPLETED';
    rental.notes = notes || rental.notes;
    rental.updatedAt = new Date();

    if (mongoose.connection.readyState === 1 && typeof rental.save === 'function') {
      await rental.save();
    } else {
      // update in-memory record
      const idx = inMemoryRentals.findIndex(
        (r) => r._id.toString() === rentalId.toString() || r.rentalNumber === rentalId
      );
      if (idx !== -1) {
        inMemoryRentals[idx] = { ...inMemoryRentals[idx], ...rental };
      }
    }

    return await this._populateRental(rental);
  }
}

module.exports = new RentalService();
