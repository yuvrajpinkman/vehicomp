const ratingService = require('../services/rating.service');

class RatingController {
  // POST /api/ratings
  async submitRating(req, res, next) {
    try {
      const userId = req.user.id || req.user._id;
      const rating = await ratingService.submitRating(req.body, userId);
      return res.status(201).json({
        success: true,
        message: 'Rating submitted successfully',
        data: rating,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/ratings/vehicle/:vehicleId
  async getVehicleRatings(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const data = await ratingService.getVehicleRatings(vehicleId);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/ratings/user/me
  async getUserRatings(req, res, next) {
    try {
      const userId = req.user.id || req.user._id;
      const ratings = await ratingService.getUserRatings(userId);
      return res.status(200).json({
        success: true,
        count: ratings.length,
        data: ratings,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/ratings/rental/:rentalId
  async getRentalRating(req, res, next) {
    try {
      const userId = req.user.id || req.user._id;
      const { rentalId } = req.params;
      const rating = await ratingService.getRatingByRental(rentalId, userId);
      return res.status(200).json({
        success: true,
        data: rating,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RatingController();
