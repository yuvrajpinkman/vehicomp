require('dotenv').config();
const request = require('supertest');
const { signToken } = require('../src/utils/jwt');
const app = require('../src/app');

describe('Rental Lifecycle & Late-Return Calculation API (/api/rentals)', () => {
  const mockUserId = '65f1a2b3c4d5e6f7a8b9c099';
  const targetVehicleId = '65f1a2b3c4d5e6f7a8b9c002'; // Venue in seed/in-memory store
  let authHeader;
  let activeRentalId;

  beforeAll(() => {
    const token = signToken({ id: mockUserId, email: 'customer@example.com', role: 'CUSTOMER' });
    authHeader = `Bearer ${token}`;
  });

  describe('POST /api/rentals/start - Starting a Rental', () => {
    it('should reject rental start if vehicle ID is missing', async () => {
      const res = await request(app)
        .post('/api/rentals/start')
        .set('Authorization', authHeader)
        .send({ initialOdometer: 1000 });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Vehicle ID is required/i);
    });

    it('should successfully start a rental and transition vehicle to RENTED', async () => {
      const expectedReturnDate = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
      const res = await request(app)
        .post('/api/rentals/start')
        .set('Authorization', authHeader)
        .send({
          vehicleId: targetVehicleId,
          expectedReturnDate,
          initialOdometer: 15000,
          notes: 'Customer trip to Pune',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('rentalNumber');
      expect(res.body.data.status).toBe('ACTIVE');
      expect(res.body.data.initialOdometer).toBe(15000);

      activeRentalId = res.body.data._id;
    });

    it('should REJECT starting another rental for the same vehicle while status is RENTED', async () => {
      const res = await request(app)
        .post('/api/rentals/start')
        .set('Authorization', authHeader)
        .send({
          vehicleId: targetVehicleId,
          initialOdometer: 15100,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Cannot rent vehicle/i);
    });
  });

  describe('GET /api/rentals/active & /api/rentals/my', () => {
    it('should fetch active rentals list', async () => {
      const res = await request(app)
        .get('/api/rentals/active')
        .set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should fetch user rental history', async () => {
      const res = await request(app)
        .get('/api/rentals/my')
        .set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should fetch single rental details by ID', async () => {
      const res = await request(app)
        .get(`/api/rentals/${activeRentalId}`)
        .set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(activeRentalId);
    });
  });

  describe('POST /api/rentals/:id/return - Returning Rental & Late Fee Calculation', () => {
    it('should reject return if return odometer is less than initial odometer', async () => {
      const res = await request(app)
        .post(`/api/rentals/${activeRentalId}/return`)
        .set('Authorization', authHeader)
        .send({
          returnOdometer: 14000, // less than 15000
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/cannot be less than initial odometer/i);
    });

    it('should return vehicle on time with zero late fee and transition status to RETURNED', async () => {
      const res = await request(app)
        .post(`/api/rentals/${activeRentalId}/return`)
        .set('Authorization', authHeader)
        .send({
          returnOdometer: 15350,
          notes: 'Vehicle returned cleanly with full tank',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('COMPLETED');
      expect(res.body.data.returnOdometer).toBe(15350);
      expect(res.body.data.lateHours).toBe(0);
      expect(res.body.data.lateFee).toBe(0);
    });

    it('should reject returning an already completed rental', async () => {
      const res = await request(app)
        .post(`/api/rentals/${activeRentalId}/return`)
        .set('Authorization', authHeader)
        .send({
          returnOdometer: 15400,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already completed/i);
    });

    it('should calculate late hours and late fee when returned past expectedReturnDate', async () => {
      // Create a rental with expectedReturnDate in the past (e.g. 5 hours ago)
      const pastVehicleId = '65f1a2b3c4d5e6f7a8b9c003'; // City in seed store
      const pastExpectedReturn = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();

      const startRes = await request(app)
        .post('/api/rentals/start')
        .set('Authorization', authHeader)
        .send({
          vehicleId: pastVehicleId,
          expectedReturnDate: pastExpectedReturn,
          initialOdometer: 20000,
        });

      expect(startRes.status).toBe(201);
      const lateRentalId = startRes.body.data._id;

      // Return rental now
      const returnRes = await request(app)
        .post(`/api/rentals/${lateRentalId}/return`)
        .set('Authorization', authHeader)
        .send({
          returnOdometer: 20250,
          notes: 'Delayed return due to traffic',
        });

      expect(returnRes.status).toBe(200);
      expect(returnRes.body.data.status).toBe('COMPLETED');
      expect(returnRes.body.data.lateHours).toBeGreaterThanOrEqual(4);
      expect(returnRes.body.data.lateFee).toBeGreaterThan(0);
      expect(returnRes.body.data.lateFee).toBe(returnRes.body.data.lateHours * 15);
    });
  });
});
