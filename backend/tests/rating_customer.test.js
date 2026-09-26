require('dotenv').config();
const request = require('supertest');
const { signToken } = require('../src/utils/jwt');
const app = require('../src/app');
const ratingService = require('../src/services/rating.service');
const customerService = require('../src/services/customer.service');
const vehicleService = require('../src/services/vehicle.service');
const rentalService = require('../src/services/rental.service');

describe('Stage 7 — Rating & Customer Dashboard', () => {
  const mockUserId = '65f1a2b3c4d5e6f7a8b9c099';
  let authHeader;
  let testVehicle;
  let testRental;

  beforeAll(async () => {
    const token = signToken({ id: mockUserId, email: 'customer_stage7@example.com', role: 'CUSTOMER' });
    authHeader = `Bearer ${token}`;

    testVehicle = await vehicleService.createVehicle({
      make: 'Tesla',
      model: 'Model Y',
      year: 2024,
      registrationNumber: `REG-ST7-${Date.now()}`,
      vehicleType: 'ELECTRIC',
      dailyRate: 120,
      pricePerDay: 120,
      fuelType: 'ELECTRIC',
      transmission: 'AUTOMATIC',
      seatingCapacity: 5,
      location: { city: 'City Center Hub' },
      status: 'AVAILABLE',
      rating: 4.5,
      totalRatings: 1,
    });

    testRental = await rentalService.startRental(
      {
        vehicleId: testVehicle._id || testVehicle.id,
        expectedReturnDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        initialOdometer: 5000,
        notes: 'Stage 7 test rental',
      },
      mockUserId
    );
  });

  describe('1. Rating Service & API', () => {
    it('should submit a valid vehicle rating (POST /api/ratings)', async () => {
      const vehicleId = (testVehicle._id || testVehicle.id).toString();
      const rentalId = (testRental._id || testRental.id).toString();

      const res = await request(app)
        .post('/api/ratings')
        .set('Authorization', authHeader)
        .send({
          vehicleId,
          rentalId,
          score: 5,
          comment: 'Outstanding electric car experience!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.score).toBe(5);
      expect(res.body.data.comment).toBe('Outstanding electric car experience!');
    });

    it('should reject rating score less than 1 or greater than 5', async () => {
      const vehicleId = testVehicle._id || testVehicle.id;

      const resHigh = await request(app)
        .post('/api/ratings')
        .set('Authorization', authHeader)
        .send({
          vehicleId,
          score: 6,
          comment: 'Invalid high score',
        });

      expect(resHigh.status).toBe(400);

      const resLow = await request(app)
        .post('/api/ratings')
        .set('Authorization', authHeader)
        .send({
          vehicleId,
          score: 0,
          comment: 'Invalid low score',
        });

      expect(resLow.status).toBe(400);
    });

    it('should prevent duplicate rating submission for the same rental', async () => {
      const vehicleId = testVehicle._id || testVehicle.id;
      const rentalId = testRental._id || testRental.id;

      const res = await request(app)
        .post('/api/ratings')
        .set('Authorization', authHeader)
        .send({
          vehicleId,
          rentalId,
          score: 4,
          comment: 'Duplicate submission test',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already submitted a rating/i);
    });

    it('should fetch ratings for a vehicle (GET /api/ratings/vehicle/:vehicleId)', async () => {
      const vehicleId = (testVehicle._id || testVehicle.id).toString();

      const res = await request(app).get(`/api/ratings/vehicle/${vehicleId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.vehicleId).toBe(vehicleId);
      expect(res.body.data.totalRatings).toBeGreaterThanOrEqual(1);
    });

    it('should fetch user rating history (GET /api/ratings/user/me)', async () => {
      const res = await request(app)
        .get('/api/ratings/user/me')
        .set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('2. Customer Dashboard Service & API', () => {
    it('should aggregate customer dashboard stats (GET /api/customer/dashboard)', async () => {
      const res = await request(app)
        .get('/api/customer/dashboard')
        .set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary).toHaveProperty('totalReservations');
      expect(res.body.data.summary).toHaveProperty('activeRentals');
      expect(res.body.data.summary).toHaveProperty('completedRentals');
      expect(res.body.data.summary).toHaveProperty('totalSpent');
      expect(res.body.data.summary).toHaveProperty('ratingsCount');
      expect(res.body.data.summary.ratingsCount).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(res.body.data.recentRentals)).toBe(true);
    });
  });
});
