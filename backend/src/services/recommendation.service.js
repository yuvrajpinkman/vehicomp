const { Vehicle } = require('../models/Vehicle');
let Reservation;
try {
  Reservation = require('../models/Reservation').Reservation;
} catch (e) {
  Reservation = null;
}

// Reference coordinate lookup for major Indian metropolitan hubs
const CITY_COORDINATES = {
  hyderabad: { lat: 17.3850, lng: 78.4867 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  mumbai: { lat: 19.0760, lng: 72.8777 },
  delhi: { lat: 28.6139, lng: 77.2090 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  pune: { lat: 18.5204, lng: 73.8567 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
};

/**
 * Calculates the great-circle distance between two geographical points using the Haversine formula.
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number} Distance in kilometers rounded to 1 decimal place
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return null;
  }
  const toRad = (angle) => (angle * Math.PI) / 180;
  const R = 6371; // Earth's mean radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

class RecommendationService {
  /**
   * Computes individual component scores and final weighted composite recommendation score for a vehicle.
   * @param {Object} vehicle Vehicle document or POJO
   * @param {Object} criteria Search and preference criteria
   * @param {Object} weights Importance weights (sum to 1.0)
   * @returns {Object} Score details, breakdown, and highlights
   */
  calculateVehicleScore(vehicle, criteria = {}, weights = {}) {
    // 1. Resolve normalized weights (default: Price 30%, Rating 25%, Condition 20%, Distance 15%, Fuel 10%)
    const rawWeights = {
      price: weights.price !== undefined ? Math.max(0, Number(weights.price)) : 0.30,
      rating: weights.rating !== undefined ? Math.max(0, Number(weights.rating)) : 0.25,
      condition: weights.condition !== undefined ? Math.max(0, Number(weights.condition)) : 0.20,
      distance: weights.distance !== undefined ? Math.max(0, Number(weights.distance)) : 0.15,
      fuel: weights.fuel !== undefined ? Math.max(0, Number(weights.fuel)) : 0.10,
    };
    const totalRawWeight =
      rawWeights.price + rawWeights.rating + rawWeights.condition + rawWeights.distance + rawWeights.fuel || 1;
    const w = {
      price: rawWeights.price / totalRawWeight,
      rating: rawWeights.rating / totalRawWeight,
      condition: rawWeights.condition / totalRawWeight,
      distance: rawWeights.distance / totalRawWeight,
      fuel: rawWeights.fuel / totalRawWeight,
    };

    const highlights = [];

    // --- A. Price Score (0 - 100) ---
    let priceScore = 80; // default baseline
    const price = Number(vehicle.pricePerDay) || 0;
    const minPrice = criteria.minPrice !== undefined ? Number(criteria.minPrice) : null;
    const maxPrice = criteria.maxPrice !== undefined ? Number(criteria.maxPrice) : null;

    if (minPrice !== null && maxPrice !== null && maxPrice >= minPrice) {
      if (price >= minPrice && price <= maxPrice) {
        // Within budget range: cheaper within range gets higher score (60 - 100)
        const range = maxPrice - minPrice || 1;
        const relativePosition = (price - minPrice) / range;
        priceScore = Math.round(100 - relativePosition * 40);
        highlights.push('Budget Match');
      } else if (price < minPrice) {
        // Below minimum: fantastic bargain
        priceScore = 100;
        highlights.push('Super Value');
      } else {
        // Exceeds maximum budget: progressive penalty
        const overflow = (price - maxPrice) / (maxPrice || 1);
        priceScore = Math.max(0, Math.round(60 - overflow * 100));
      }
    } else if (maxPrice !== null) {
      if (price <= maxPrice) {
        priceScore = Math.round(100 - (price / maxPrice) * 30);
        highlights.push('Under Budget');
      } else {
        const overflow = (price - maxPrice) / (maxPrice || 1);
        priceScore = Math.max(0, Math.round(60 - overflow * 100));
      }
    } else {
      // General affordability benchmark (e.g. relative to ₹2500)
      priceScore = Math.max(30, Math.min(100, Math.round(100 - (price / 5000) * 50)));
    }

    if (priceScore >= 90 && !highlights.includes('Budget Match')) {
      highlights.push('Great Value');
    }

    // --- B. Customer Rating Score (0 - 100) ---
    const rating = vehicle.rating !== undefined ? Number(vehicle.rating) : 4.5;
    const ratingScore = Math.min(100, Math.max(0, Math.round((rating / 5.0) * 100)));
    if (rating >= 4.7) {
      highlights.push('Top Rated ⭐');
    }

    // --- C. Vehicle Condition Score (0 - 100) ---
    const condition = (vehicle.condition || 'EXCELLENT').toUpperCase();
    let conditionScore = 80;
    switch (condition) {
      case 'EXCELLENT':
        conditionScore = 100;
        highlights.push('Mint Condition');
        break;
      case 'GOOD':
        conditionScore = 80;
        break;
      case 'FAIR':
        conditionScore = 50;
        break;
      case 'POOR':
        conditionScore = 20;
        break;
      default:
        conditionScore = 75;
    }

    // --- D. Distance Score (0 - 100) ---
    let distanceKm = null;
    let distanceScore = 80; // default baseline

    // Determine target customer coordinates
    let targetLat = criteria.latitude !== undefined ? Number(criteria.latitude) : criteria.userLat;
    let targetLng = criteria.longitude !== undefined ? Number(criteria.longitude) : criteria.userLng;

    if ((targetLat === undefined || targetLng === undefined) && criteria.city) {
      const cityKey = criteria.city.toLowerCase().trim();
      if (CITY_COORDINATES[cityKey]) {
        targetLat = CITY_COORDINATES[cityKey].lat;
        targetLng = CITY_COORDINATES[cityKey].lng;
      }
    }

    // Determine vehicle coordinates
    const vLat = vehicle.location?.coordinates?.latitude;
    const vLng = vehicle.location?.coordinates?.longitude;

    if (targetLat !== undefined && targetLng !== undefined && vLat !== undefined && vLng !== undefined) {
      distanceKm = haversineDistance(targetLat, targetLng, vLat, vLng);
      // Distance scoring: 0km = 100, 10km = 75, 20km = 50, 40km+ = 0
      distanceScore = Math.max(0, Math.min(100, Math.round(100 - distanceKm * 2.5)));
      if (distanceKm <= 5) {
        highlights.push('Nearby (<5 km)');
      } else if (distanceKm <= 15) {
        highlights.push('Convenient Location');
      }
    } else if (criteria.city && vehicle.location?.city) {
      // Same city fallback
      if (criteria.city.toLowerCase().trim() === vehicle.location.city.toLowerCase().trim()) {
        distanceScore = 90;
        highlights.push('In Your City');
      } else {
        distanceScore = 40;
      }
    }

    // --- E. Fuel / Energy Type Score (0 - 100) ---
    const vehicleFuel = (vehicle.fuelType || '').toUpperCase();
    const preferredFuel = (criteria.preferredFuel || criteria.fuelType || '').toUpperCase();
    let fuelScore = 70;

    if (preferredFuel && preferredFuel !== 'ANY') {
      if (vehicleFuel === preferredFuel) {
        fuelScore = 100;
        highlights.push(`Fuel: ${vehicleFuel}`);
      } else if (
        (preferredFuel === 'ELECTRIC' || preferredFuel === 'HYBRID') &&
        (vehicleFuel === 'ELECTRIC' || vehicleFuel === 'HYBRID')
      ) {
        fuelScore = 90;
        highlights.push('Eco-Friendly');
      } else {
        fuelScore = 50;
      }
    } else {
      // Bonus for green technology when no strict preference is specified
      if (vehicleFuel === 'ELECTRIC' || vehicleFuel === 'HYBRID') {
        fuelScore = 95;
        highlights.push('Eco-Friendly ⚡');
      } else {
        fuelScore = 80;
      }
    }

    // --- Composite Recommendation Score ---
    const rawComposite =
      w.price * priceScore +
      w.rating * ratingScore +
      w.condition * conditionScore +
      w.distance * distanceScore +
      w.fuel * fuelScore;

    const recommendationScore = Math.min(100, Math.max(0, Math.round(rawComposite)));

    return {
      recommendationScore,
      scoreBreakdown: {
        priceScore,
        ratingScore,
        conditionScore,
        distanceScore,
        fuelScore,
        distanceKm,
        weights: w,
      },
      matchHighlights: [...new Set(highlights)],
    };
  }

  /**
   * Main recommendation engine query: filters suitable available vehicles and ranks by multi-factor score.
   * @param {Object} criteria Filter & user preference parameters
   * @param {Object} options Sorting, pagination, and weighting options
   * @returns {Promise<Array>} Ranked vehicle recommendations
   */
  async getRecommendations(criteria = {}, options = {}) {
    const {
      vehicleType,
      city,
      minPrice,
      maxPrice,
      fuelType,
      preferredFuel,
      condition,
      minRating,
      startDate,
      endDate,
    } = criteria;

    const query = {
      status: 'AVAILABLE',
      isActive: true,
      isDeleted: false,
    };

    // Filter by vehicle type (e.g. SUV, SEDAN)
    if (vehicleType && vehicleType.toUpperCase() !== 'ALL') {
      query.vehicleType = vehicleType.toUpperCase();
    }

    // Filter by city if specified
    if (city && city.trim() !== '') {
      query['location.city'] = new RegExp(city.trim(), 'i');
    }

    // Fetch candidate vehicles
    let vehicles = [];
    try {
      vehicles = await Vehicle.find(query).lean();
    } catch (err) {
      // In-memory fallback if database is not reachable
      vehicles = [];
    }

    // Check date availability against conflicting reservations if dates provided
    if (Reservation && startDate && endDate && vehicles.length > 0) {
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const conflictingReservations = await Reservation.find({
          status: { $in: ['CONFIRMED', 'PENDING'] },
          $or: [
            { startDate: { $lte: end }, endDate: { $gte: start } },
          ],
        }).select('vehicle').lean();

        const bookedVehicleIds = new Set(conflictingReservations.map((r) => r.vehicle?.toString()));
        vehicles = vehicles.filter((v) => !bookedVehicleIds.has(v._id.toString()));
      } catch (err) {
        // Continue if reservations cannot be fetched
      }
    }

    // Optional hard filter for minRating
    if (minRating !== undefined && minRating !== null) {
      const minR = Number(minRating);
      vehicles = vehicles.filter((v) => (v.rating || 4.5) >= minR);
    }

    // Score and rank all candidate vehicles
    const scoredVehicles = vehicles.map((v) => {
      const scoreData = this.calculateVehicleScore(v, criteria, options.weights || {});
      return {
        ...v,
        recommendationScore: scoreData.recommendationScore,
        scoreBreakdown: scoreData.scoreBreakdown,
        matchHighlights: scoreData.matchHighlights,
      };
    });

    // Rank in descending order of recommendation score
    scoredVehicles.sort((a, b) => b.recommendationScore - a.recommendationScore);

    // Apply limit if requested
    const limit = options.limit ? parseInt(options.limit, 10) : 50;
    return scoredVehicles.slice(0, limit);
  }
}

module.exports = {
  RecommendationService: new RecommendationService(),
  haversineDistance,
  CITY_COORDINATES,
};
