const mongoose = require('mongoose');
const Rating = require('../models/Rating');
const { Vehicle } = require('../models/Vehicle');
const vehicleService = require('./vehicle.service');
const rentalService = require('./rental.service');

// In-memory fallback store for when MongoDB is disconnected
const ratingStore = [];

class RatingService {
  /**
   * Submit a new rating for a vehicle
   * @param {Object} data - { vehicleId, rentalId, score, comment }
   * @param {String} userId - ID of the rating customer
   */
  async submitRating(data, userId) {
    const { vehicleId, rentalId, score, comment } = data;

    // 1. Validation
    if (!vehicleId) {
      const error = new Error('Vehicle ID is required');
      error.statusCode = 400;
      throw error;
    }

    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 1 || numScore > 5) {
      const error = new Error('Rating score must be a number between 1 and 5');
      error.statusCode = 400;
      throw error;
    }

    // 2. Verify Vehicle exists
    const vehicle = await vehicleService.getVehicleById(vehicleId);
    if (!vehicle) {
      const error = new Error('Vehicle not found');
      error.statusCode = 404;
      throw error;
    }

    // 3. Optional Rental verification & duplicate check
    if (rentalId) {
      const existingRentalRating = await this.getRatingByRental(rentalId, userId);
      if (existingRentalRating) {
        const error = new Error('You have already submitted a rating for this rental');
        error.statusCode = 400;
        throw error;
      }
    }

    // 4. Save rating (Mongoose vs In-Memory)
    let ratingDoc;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      try {
        ratingDoc = await Rating.create({
          user: userId,
          vehicle: vehicleId,
          rental: rentalId || null,
          score: numScore,
          comment: comment || '',
        });
        await ratingDoc.populate('user', 'name email');
        ratingDoc = ratingDoc.toObject();
      } catch (err) {
        if (err.code === 11000) {
          const error = new Error('You have already submitted a rating for this rental');
          error.statusCode = 400;
          throw error;
        }
        throw err;
      }
    } else {
      ratingDoc = {
        _id: `RATING-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        id: `RATING-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        user: userId,
        vehicle: vehicleId,
        rental: rentalId || null,
        score: numScore,
        comment: comment || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      ratingStore.push(ratingDoc);
    }

    // 5. Update vehicle aggregate rating
    await this.updateVehicleAggregateRating(vehicleId, numScore);

    return ratingDoc;
  }

  /**
   * Recalculates and updates vehicle's average rating & total ratings count
   */
  async updateVehicleAggregateRating(vehicleId, newScore) {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const ratings = await Rating.find({ vehicle: vehicleId });
      if (ratings.length > 0) {
        const total = ratings.reduce((sum, r) => sum + r.score, 0);
        const avgRating = Math.round((total / ratings.length) * 10) / 10;

        await Vehicle.findByIdAndUpdate(vehicleId, {
          rating: avgRating,
          totalRatings: ratings.length,
        });
      }
    } else {
      // In-memory recalculation
      const vehicleRatings = ratingStore.filter((r) => String(r.vehicle) === String(vehicleId));
      if (vehicleRatings.length > 0) {
        const total = vehicleRatings.reduce((sum, r) => sum + Number(r.score), 0);
        const avgRating = Math.round((total / vehicleRatings.length) * 10) / 10;
        
        // Update in vehicle memory store if exists
        try {
          const vehicle = await vehicleService.getVehicleById(vehicleId);
          if (vehicle) {
            vehicle.rating = avgRating;
            vehicle.totalRatings = vehicleRatings.length;
          }
        } catch (e) {
          // ignore error if vehicle store format varies
        }
      }
    }
  }

  /**
   * Get ratings for a specific vehicle
   */
  async getVehicleRatings(vehicleId) {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const ratings = await Rating.find({ vehicle: vehicleId })
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

      const totalRatings = ratings.length;
      const averageRating =
        totalRatings > 0
          ? Math.round((ratings.reduce((sum, r) => sum + r.score, 0) / totalRatings) * 10) / 10
          : 0;

      return {
        vehicleId: vehicleId ? vehicleId.toString() : null,
        averageRating,
        totalRatings,
        ratings,
      };
    } else {
      const ratings = ratingStore
        .filter((r) => String(r.vehicle) === String(vehicleId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const totalRatings = ratings.length;
      const averageRating =
        totalRatings > 0
          ? Math.round((ratings.reduce((sum, r) => sum + Number(r.score), 0) / totalRatings) * 10) / 10
          : 0;

      return {
        vehicleId,
        averageRating,
        totalRatings,
        ratings,
      };
    }
  }

  /**
   * Get ratings submitted by a specific user
   */
  async getUserRatings(userId) {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      return await Rating.find({ user: userId })
        .populate('vehicle', 'make model registrationNumber vehicleType pricePerDay')
        .sort({ createdAt: -1 });
    } else {
      return ratingStore
        .filter((r) => String(r.user) === String(userId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }

  /**
   * Check rating submitted for a specific rental
   */
  async getRatingByRental(rentalId, userId) {
    if (!rentalId) return null;

    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      return await Rating.findOne({ rental: rentalId, user: userId });
    } else {
      return ratingStore.find(
        (r) => String(r.rental) === String(rentalId) && String(r.user) === String(userId)
      ) || null;
    }
  }
}

module.exports = new RatingService();
