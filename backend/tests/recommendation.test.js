require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const { Vehicle } = require('../src/models/Vehicle');
const {
  RecommendationService,
  haversineDistance,
  CITY_COORDINATES,
} = require('../src/services/recommendation.service');

describe('Stage 6 — Recommendation Engine Test Suite', () => {
  let createdVehicles = [];

  const sampleVehicles = [
    {
      registrationNumber: 'REC-SUV-001',
      make: 'Hyundai',
      model: 'Creta',
      year: 2023,
      vehicleType: 'SUV',
      fuelType: 'PETROL',
      pricePerDay: 2500,
      condition: 'EXCELLENT',
      rating: 4.8,
      status: 'AVAILABLE',
      location: {
        city: 'Hyderabad',
        address: 'Banjara Hills',
        coordinates: { latitude: 17.4156, longitude: 78.4350 },
      },
    },
    {
      registrationNumber: 'REC-SUV-002',
      make: 'Tata',
      model: 'Nexon EV',
      year: 2024,
      vehicleType: 'SUV',
      fuelType: 'ELECTRIC',
      pricePerDay: 2800,
      condition: 'EXCELLENT',
      rating: 4.9,
      status: 'AVAILABLE',
      location: {
        city: 'Hyderabad',
        address: 'Gachibowli',
        coordinates: { latitude: 17.4401, longitude: 78.3489 },
      },
    },
    {
      registrationNumber: 'REC-SED-003',
      make: 'Honda',
      model: 'City',
      year: 2021,
      vehicleType: 'SEDAN',
      fuelType: 'PETROL',
      pricePerDay: 2200,
      condition: 'GOOD',
      rating: 4.4,
      status: 'AVAILABLE',
      location: {
        city: 'Hyderabad',
        address: 'Secunderabad',
        coordinates: { latitude: 17.4399, longitude: 78.4983 },
      },
    },
    {
      registrationNumber: 'REC-SUV-004',
      make: 'Mahindra',
      model: 'XUV700',
      year: 2022,
      vehicleType: 'SUV',
      fuelType: 'DIESEL',
      pricePerDay: 4500, // expensive / outside typical ₹2000-₹3000 budget
      condition: 'FAIR',
      rating: 4.1,
      status: 'AVAILABLE',
      location: {
        city: 'Hyderabad',
        address: 'Shamshabad Airport',
        coordinates: { latitude: 17.2403, longitude: 78.4294 },
      },
    },
    {
      registrationNumber: 'REC-UNAVAIL-005',
      make: 'Toyota',
      model: 'Fortuner',
      year: 2023,
      vehicleType: 'SUV',
      fuelType: 'DIESEL',
      pricePerDay: 5000,
      condition: 'EXCELLENT',
      rating: 5.0,
      status: 'RENTED', // Not available
      location: {
        city: 'Hyderabad',
        address: 'Jubilee Hills',
        coordinates: { latitude: 17.4319, longitude: 78.4073 },
      },
    },
  ];

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicomp';
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    }
    if (mongoose.connection.readyState === 1) {
      await Vehicle.deleteMany({ registrationNumber: /^REC-/ });
      createdVehicles = await Vehicle.insertMany(sampleVehicles);
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await Vehicle.deleteMany({ registrationNumber: /^REC-/ });
    }
  });

  describe('1. Haversine Distance Calculations', () => {
    it('should compute distance accurately between Hyderabad and Bangalore (~500 km)', () => {
      const hyd = CITY_COORDINATES.hyderabad;
      const blr = CITY_COORDINATES.bangalore;
      const distance = haversineDistance(hyd.lat, hyd.lng, blr.lat, blr.lng);

      expect(distance).toBeGreaterThan(450);
      expect(distance).toBeLessThan(550);
    });

    it('should return 0 km for identical coordinates', () => {
      const distance = haversineDistance(17.3850, 78.4867, 17.3850, 78.4867);
      expect(distance).toBe(0);
    });

    it('should handle undefined or null coordinates safely', () => {
      expect(haversineDistance(undefined, 78.4, 17.3, 78.5)).toBeNull();
      expect(haversineDistance(17.3, undefined, 17.3, 78.5)).toBeNull();
    });
  });

  describe('2. Multi-Attribute Vehicle Scoring Algorithm', () => {
    const testCar = {
      pricePerDay: 2500,
      condition: 'EXCELLENT',
      rating: 4.8,
      fuelType: 'ELECTRIC',
      location: {
        city: 'Hyderabad',
        coordinates: { latitude: 17.3850, longitude: 78.4867 },
      },
    };

    it('should award high price score for vehicles within budget range', () => {
      const result = RecommendationService.calculateVehicleScore(testCar, {
        minPrice: 2000,
        maxPrice: 3000,
      });

      expect(result.scoreBreakdown.priceScore).toBeGreaterThanOrEqual(80);
      expect(result.matchHighlights).toContain('Budget Match');
    });

    it('should penalize vehicle price if far exceeding user max budget', () => {
      const expensiveCar = { ...testCar, pricePerDay: 6000 };
      const result = RecommendationService.calculateVehicleScore(expensiveCar, {
        minPrice: 2000,
        maxPrice: 3000,
      });

      expect(result.scoreBreakdown.priceScore).toBeLessThan(60);
    });

    it('should score EXCELLENT condition (100) higher than GOOD (80) or FAIR (50)', () => {
      const excellentCar = { ...testCar, condition: 'EXCELLENT' };
      const fairCar = { ...testCar, condition: 'FAIR' };

      const scoreExcellent = RecommendationService.calculateVehicleScore(excellentCar);
      const scoreFair = RecommendationService.calculateVehicleScore(fairCar);

      expect(scoreExcellent.scoreBreakdown.conditionScore).toBe(100);
      expect(scoreFair.scoreBreakdown.conditionScore).toBe(50);
      expect(scoreExcellent.recommendationScore).toBeGreaterThan(scoreFair.recommendationScore);
    });

    it('should grant fuel preference bonus when vehicle matches requested fuel', () => {
      const resultMatch = RecommendationService.calculateVehicleScore(testCar, {
        preferredFuel: 'ELECTRIC',
      });
      const resultMismatch = RecommendationService.calculateVehicleScore(
        { ...testCar, fuelType: 'DIESEL' },
        { preferredFuel: 'ELECTRIC' }
      );

      expect(resultMatch.scoreBreakdown.fuelScore).toBe(100);
      expect(resultMismatch.scoreBreakdown.fuelScore).toBe(50);
      expect(resultMatch.matchHighlights).toContain('Fuel: ELECTRIC');
    });

    it('should factor distance and proximity into scoring', () => {
      const hydCenter = CITY_COORDINATES.hyderabad;
      const nearCar = {
        ...testCar,
        location: { coordinates: { latitude: 17.3860, longitude: 78.4870 } }, // ~0.15 km away
      };
      const farCar = {
        ...testCar,
        location: { coordinates: { latitude: 17.6500, longitude: 78.7500 } }, // ~40 km away
      };

      const scoreNear = RecommendationService.calculateVehicleScore(nearCar, {
        latitude: hydCenter.lat,
        longitude: hydCenter.lng,
      });
      const scoreFar = RecommendationService.calculateVehicleScore(farCar, {
        latitude: hydCenter.lat,
        longitude: hydCenter.lng,
      });

      expect(scoreNear.scoreBreakdown.distanceScore).toBeGreaterThan(95);
      expect(scoreFar.scoreBreakdown.distanceScore).toBeLessThan(50);
      expect(scoreNear.recommendationScore).toBeGreaterThan(scoreFar.recommendationScore);
    });

    it('should respect custom weight overrides', () => {
      // 100% weight on condition vs 100% weight on price
      const cheapBeater = {
        ...testCar,
        pricePerDay: 1000,
        condition: 'POOR',
      };

      const weightedForPrice = RecommendationService.calculateVehicleScore(
        cheapBeater,
        { minPrice: 800, maxPrice: 1500 },
        { price: 1.0, condition: 0, rating: 0, distance: 0, fuel: 0 }
      );

      const weightedForCondition = RecommendationService.calculateVehicleScore(
        cheapBeater,
        { minPrice: 800, maxPrice: 1500 },
        { price: 0, condition: 1.0, rating: 0, distance: 0, fuel: 0 }
      );

      expect(weightedForPrice.recommendationScore).toBeGreaterThanOrEqual(85);
      expect(weightedForCondition.recommendationScore).toBeLessThanOrEqual(25);
    });
  });

  describe('3. REST API Endpoints', () => {
    it('GET /api/recommendations should return 200 with ranked recommendations', async () => {
      const res = await request(app)
        .get('/api/recommendations')
        .query({
          vehicleType: 'SUV',
          city: 'Hyderabad',
          minPrice: 2000,
          maxPrice: 3000,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);

      if (res.body.data.length > 0) {
        const topVehicle = res.body.data[0];
        expect(topVehicle).toHaveProperty('recommendationScore');
        expect(topVehicle).toHaveProperty('scoreBreakdown');
        expect(topVehicle).toHaveProperty('matchHighlights');

        // Verify descending rank order
        for (let i = 1; i < res.body.data.length; i++) {
          expect(res.body.data[i - 1].recommendationScore).toBeGreaterThanOrEqual(
            res.body.data[i].recommendationScore
          );
        }

        // Must not include rented/unavailable vehicles
        const nonAvailable = res.body.data.filter((v) => v.status !== 'AVAILABLE');
        expect(nonAvailable.length).toBe(0);
      }
    });

    it('POST /api/recommendations should accept criteria with preferred fuel and custom weights', async () => {
      const payload = {
        vehicleType: 'SUV',
        preferredFuel: 'ELECTRIC',
        minPrice: 2000,
        maxPrice: 3500,
        city: 'Hyderabad',
        weights: {
          fuel: 0.40,
          price: 0.30,
          rating: 0.15,
          condition: 0.10,
          distance: 0.05,
        },
      };

      const res = await request(app).post('/api/recommendations').send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      if (res.body.data.length > 0) {
        // The top vehicle should ideally be the Electric SUV if present
        const electricVehicles = res.body.data.filter((v) => v.fuelType === 'ELECTRIC');
        if (electricVehicles.length > 0) {
          expect(res.body.data[0].fuelType).toBe('ELECTRIC');
        }
      }
    });

    it('GET /api/recommendations should filter strictly by vehicleType', async () => {
      const res = await request(app)
        .get('/api/recommendations')
        .query({ vehicleType: 'SEDAN' });

      expect(res.status).toBe(200);
      if (res.body.data.length > 0) {
        const nonSedans = res.body.data.filter((v) => v.vehicleType !== 'SEDAN');
        expect(nonSedans.length).toBe(0);
      }
    });
  });
});
