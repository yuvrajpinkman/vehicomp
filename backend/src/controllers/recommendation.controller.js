const { RecommendationService } = require('../services/recommendation.service');

class RecommendationController {
  /**
   * Retrieves prioritized vehicle recommendations based on multi-attribute criteria.
   * Supports GET with query parameters or POST with request body.
   */
  async getRecommendations(req, res, next) {
    try {
      // Merge query and body so both GET and POST work seamlessly
      const params = {
        ...req.query,
        ...(req.body || {}),
      };

      const criteria = {
        vehicleType: params.vehicleType || params.type,
        city: params.city || params.location,
        latitude: params.latitude || params.lat || params.userLat,
        longitude: params.longitude || params.lng || params.userLng,
        minPrice: params.minPrice !== undefined ? Number(params.minPrice) : undefined,
        maxPrice: params.maxPrice !== undefined ? Number(params.maxPrice) : undefined,
        preferredFuel: params.preferredFuel || params.fuelType,
        condition: params.condition,
        minRating: params.minRating !== undefined ? Number(params.minRating) : undefined,
        startDate: params.startDate,
        endDate: params.endDate,
      };

      // Custom weights if user customized prioritization
      let weights = {};
      if (params.weights && typeof params.weights === 'object') {
        weights = params.weights;
      } else {
        if (params.weightPrice !== undefined) weights.price = Number(params.weightPrice);
        if (params.weightRating !== undefined) weights.rating = Number(params.weightRating);
        if (params.weightCondition !== undefined) weights.condition = Number(params.weightCondition);
        if (params.weightDistance !== undefined) weights.distance = Number(params.weightDistance);
        if (params.weightFuel !== undefined) weights.fuel = Number(params.weightFuel);
      }

      const options = {
        weights,
        limit: params.limit ? parseInt(params.limit, 10) : 50,
      };

      const recommendations = await RecommendationService.getRecommendations(criteria, options);

      return res.status(200).json({
        success: true,
        count: recommendations.length,
        criteria,
        data: recommendations,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RecommendationController();
