const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const vehicleService = require('./vehicle.service');

// In-memory fallback reservation store for offline / test environments
let inMemoryReservations = [];

class ReservationService {
  /**
   * Utility to check if two date intervals overlap
   * Interval A: [startA, endA], Interval B: [startB, endB]
   * Overlap condition: startA < endB AND endA > startB
   */
  hasOverlap(startA, endA, startB, endB) {
    const sA = new Date(startA).getTime();
    const eA = new Date(endA).getTime();
    const sB = new Date(startB).getTime();
    const eB = new Date(endB).getTime();

    return sA < eB && eA > sB;
  }

  /**
   * Check if a vehicle has conflicting active reservations for requested dates
   */
  async checkVehicleConflict(vehicleId, startDate, endDate, excludeReservationId = null) {
    const reqStart = new Date(startDate);
    const reqEnd = new Date(endDate);

    if (mongoose.connection.readyState === 1) {
      try {
        const query = {
          vehicle: vehicleId,
          status: { $in: ['CONFIRMED', 'PENDING', 'ACTIVE'] },
          $or: [
            { startDate: { $lt: reqEnd }, endDate: { $gt: reqStart } }
          ],
        };

        if (excludeReservationId) {
          query._id = { $ne: excludeReservationId };
        }

        const conflicting = await Reservation.findOne(query);
        if (conflicting) return conflicting;
      } catch (err) {
        console.warn('[ReservationService] DB query failed, using in-memory check:', err.message);
      }
    }

    // In-memory fallback check
    return inMemoryReservations.find((res) => {
      const resVehId = res.vehicle._id ? res.vehicle._id.toString() : res.vehicle.toString();
      if (resVehId !== vehicleId.toString()) return false;
      if (!['CONFIRMED', 'PENDING', 'ACTIVE'].includes(res.status)) return false;
      if (excludeReservationId && (res._id.toString() === excludeReservationId.toString())) return false;

      return this.hasOverlap(reqStart, reqEnd, res.startDate, res.endDate);
    });
  }

  /**
   * Create a new reservation
   */
  async createReservation(data, userId) {
    const { vehicleId, startDate, endDate, notes } = data;

    if (!vehicleId) {
      const error = new Error('Vehicle ID is required');
      error.statusCode = 400;
      throw error;
    }

    if (!startDate || !endDate) {
      const error = new Error('Start date and end date are required');
      error.statusCode = 400;
      throw error;
    }

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

    // Verify vehicle exists and is active
    const vehicle = await vehicleService.getVehicleById(vehicleId);
    if (!vehicle) {
      const error = new Error('Vehicle not found');
      error.statusCode = 404;
      throw error;
    }

    if (vehicle.isActive === false || vehicle.isDeleted === true) {
      const error = new Error('Vehicle is currently inactive or deleted');
      error.statusCode = 400;
      throw error;
    }

    if (vehicle.status === 'MAINTENANCE' || vehicle.status === 'DAMAGED') {
      const error = new Error(`Vehicle is currently under ${vehicle.status.toLowerCase()}`);
      error.statusCode = 400;
      throw error;
    }

    // Check for double booking conflict
    const conflict = await this.checkVehicleConflict(vehicleId, start, end);
    if (conflict) {
      const conflictStartStr = new Date(conflict.startDate).toISOString().split('T')[0];
      const conflictEndStr = new Date(conflict.endDate).toISOString().split('T')[0];
      const error = new Error(`Vehicle is already reserved for dates between ${conflictStartStr} and ${conflictEndStr}`);
      error.statusCode = 409;
      error.conflictReservation = conflict;
      throw error;
    }

    // Calculate duration & price
    const diffTime = Math.abs(end - start);
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const pricePerDay = vehicle.pricePerDay || 0;
    const totalPrice = totalDays * pricePerDay;

    const reservationNumber = `RES-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const reservationObj = {
      reservationNumber,
      user: userId,
      vehicle: vehicle._id || vehicleId,
      startDate: start,
      endDate: end,
      totalDays,
      pricePerDay,
      totalPrice,
      status: 'CONFIRMED',
      notes: notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let createdReservation = null;

    if (mongoose.connection.readyState === 1) {
      try {
        const newReservation = new Reservation(reservationObj);
        createdReservation = await newReservation.save();
        await createdReservation.populate(['vehicle', 'user']);
      } catch (err) {
        console.warn('[ReservationService] DB save failed, saving to in-memory:', err.message);
      }
    }

    if (!createdReservation) {
      const mockId = new mongoose.Types.ObjectId().toString();
      createdReservation = {
        _id: mockId,
        ...reservationObj,
        vehicle,
      };
      inMemoryReservations.push(createdReservation);
    } else {
      inMemoryReservations.push(createdReservation);
    }

    // If reservation starts today or vehicle status is AVAILABLE, update status to RESERVED if starting immediately
    const todayStr = new Date().toISOString().split('T')[0];
    const startStr = start.toISOString().split('T')[0];
    if (startStr === todayStr && vehicle.status === 'AVAILABLE') {
      try {
        await vehicleService.updateVehicleStatus(vehicle._id || vehicleId, 'RESERVED', `Customer reserved vehicle #${reservationNumber}`);
      } catch (err) {
        console.warn('[ReservationService] Status update warning:', err.message);
      }
    }

    return createdReservation;
  }

  /**
   * Get all reservations
   */
  async getReservations(filter = {}) {
    if (mongoose.connection.readyState === 1) {
      try {
        const reservations = await Reservation.find(filter)
          .populate('vehicle')
          .populate('user', 'name email phone role')
          .sort({ createdAt: -1 });
        if (reservations && reservations.length > 0) return reservations;
      } catch (err) {
        console.warn('[ReservationService] DB fetch failed, using in-memory store:', err.message);
      }
    }
    return [...inMemoryReservations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Get reservations for specific user
   */
  async getUserReservations(userId) {
    if (mongoose.connection.readyState === 1) {
      try {
        const reservations = await Reservation.find({ user: userId })
          .populate('vehicle')
          .sort({ createdAt: -1 });
        if (reservations && reservations.length > 0) return reservations;
      } catch (err) {
        console.warn('[ReservationService] DB fetch user reservations failed:', err.message);
      }
    }
    return inMemoryReservations
      .filter((r) => {
        const rUserId = r.user._id ? r.user._id.toString() : r.user.toString();
        return rUserId === userId.toString();
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Get reservation by ID
   */
  async getReservationById(id) {
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        const reservation = await Reservation.findById(id)
          .populate('vehicle')
          .populate('user', 'name email phone role');
        if (reservation) return reservation;
      } catch (err) {
        console.warn('[ReservationService] DB fetch by ID failed:', err.message);
      }
    }
    return inMemoryReservations.find((r) => r._id.toString() === id.toString()) || null;
  }

  /**
   * Cancel a reservation
   */
  async cancelReservation(id, userId, reason = '') {
    const reservation = await this.getReservationById(id);
    if (!reservation) {
      const error = new Error('Reservation not found');
      error.statusCode = 404;
      throw error;
    }

    if (['CANCELLED', 'COMPLETED', 'EXPIRED'].includes(reservation.status)) {
      const error = new Error(`Reservation is already ${reservation.status.toLowerCase()}`);
      error.statusCode = 400;
      throw error;
    }

    reservation.status = 'CANCELLED';
    reservation.cancellationReason = reason || 'Cancelled by customer';
    reservation.updatedAt = new Date();

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        await Reservation.findByIdAndUpdate(id, {
          status: 'CANCELLED',
          cancellationReason: reservation.cancellationReason,
        });
      } catch (err) {
        console.warn('[ReservationService] DB cancellation update failed:', err.message);
      }
    }

    // Update in-memory copy
    const inMemIdx = inMemoryReservations.findIndex((r) => r._id.toString() === id.toString());
    if (inMemIdx !== -1) {
      inMemoryReservations[inMemIdx].status = 'CANCELLED';
      inMemoryReservations[inMemIdx].cancellationReason = reservation.cancellationReason;
    }

    // Revert vehicle status if currently RESERVED
    const vehicleId = reservation.vehicle._id ? reservation.vehicle._id.toString() : reservation.vehicle.toString();
    const vehicle = await vehicleService.getVehicleById(vehicleId);
    if (vehicle && vehicle.status === 'RESERVED') {
      try {
        await vehicleService.updateVehicleStatus(vehicleId, 'AVAILABLE', `Reservation #${reservation.reservationNumber} cancelled`);
      } catch (err) {
        console.warn('[ReservationService] Vehicle status revert warning:', err.message);
      }
    }

    return reservation;
  }
}

module.exports = new ReservationService();
