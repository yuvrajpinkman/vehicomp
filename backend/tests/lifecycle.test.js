require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const { Vehicle } = require('../src/models/Vehicle');

describe('Vehicle Lifecycle State Machine API', () => {
  let vehicleId;
  const testReg = `TEST-LC-${Date.now().toString().slice(-6)}`;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicomp';
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    }

    // Create a pristine AVAILABLE vehicle for lifecycle testing
    const vehicle = await Vehicle.create({
      registrationNumber: testReg,
      make: 'Mahindra',
      model: 'Scorpio-N',
      year: 2024,
      vehicleType: 'SUV',
      fuelType: 'DIESEL',
      pricePerDay: 3500,
      condition: 'EXCELLENT',
      status: 'AVAILABLE',
      location: { city: 'Hyderabad', address: 'Madhapur' },
    });
    vehicleId = vehicle._id.toString();
  });

  afterAll(async () => {
    await Vehicle.deleteMany({ registrationNumber: new RegExp('^TEST-LC-', 'i') });
    await mongoose.connection.close();
  });

  describe('GET /api/vehicles/lifecycle/rules', () => {
    it('should return the lifecycle transition rules matrix', async () => {
      const res = await request(app).get('/api/vehicles/lifecycle/rules');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('transitions');
      expect(res.body.data.transitions).toHaveProperty('AVAILABLE');
      expect(res.body.data.transitions).toHaveProperty('MAINTENANCE');
    });
  });

  describe('Standard Rental Flow: AVAILABLE -> RESERVED -> RENTED -> RETURNED -> INSPECTION -> AVAILABLE', () => {
    it('1. AVAILABLE -> RESERVED (Customer books vehicle)', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/transition`)
        .send({ status: 'RESERVED', reason: 'Customer reservation #R101' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('RESERVED');
      expect(res.body.allowedNextTransitions).toEqual(expect.arrayContaining(['RENTED', 'AVAILABLE']));
    });

    it('2. RESERVED -> RENTED (Customer picks up vehicle)', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/transition`)
        .send({ status: 'RENTED', reason: 'Vehicle handed over to customer' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('RENTED');
      expect(res.body.allowedNextTransitions).toEqual(['RETURNED']);
    });

    it('3. RENTED -> RETURNED (Customer drops off vehicle)', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/transition`)
        .send({ status: 'RETURNED', reason: 'Customer completed journey' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('RETURNED');
      expect(res.body.allowedNextTransitions).toEqual(expect.arrayContaining(['INSPECTION', 'DAMAGED']));
    });

    it('4. RETURNED -> INSPECTION (Fleet staff commences inspection)', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/transition`)
        .send({ status: 'INSPECTION', reason: 'Post-trip safety inspection' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('INSPECTION');
      expect(res.body.allowedNextTransitions).toEqual(expect.arrayContaining(['AVAILABLE', 'DAMAGED', 'MAINTENANCE']));
    });

    it('5. INSPECTION -> AVAILABLE (Vehicle cleared with clean record)', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/transition`)
        .send({ status: 'AVAILABLE', reason: 'Vehicle washed and cleared for new booking' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('AVAILABLE');
      expect(res.body.allowedNextTransitions).toEqual(expect.arrayContaining(['RESERVED', 'MAINTENANCE']));
    });
  });

  describe('Damage & Maintenance Flow: RETURNED -> DAMAGED -> MAINTENANCE -> AVAILABLE', () => {
    beforeAll(async () => {
      // Put vehicle back to RETURNED state via valid sequence
      await request(app).post(`/api/vehicles/${vehicleId}/transition`).send({ status: 'RESERVED' });
      await request(app).post(`/api/vehicles/${vehicleId}/transition`).send({ status: 'RENTED' });
      await request(app).post(`/api/vehicles/${vehicleId}/transition`).send({ status: 'RETURNED' });
    });

    it('1. RETURNED -> DAMAGED (Damage identified at drop-off)', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/transition`)
        .send({ status: 'DAMAGED', notes: 'Dent on rear bumper', reason: 'Accident reported' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('DAMAGED');
      expect(res.body.allowedNextTransitions).toEqual(['MAINTENANCE']);
    });

    it('2. DAMAGED -> MAINTENANCE (Sent to workshop)', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/transition`)
        .send({ status: 'MAINTENANCE', reason: 'Body shop repair order #M-888' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('MAINTENANCE');
      expect(res.body.allowedNextTransitions).toEqual(expect.arrayContaining(['AVAILABLE', 'INSPECTION']));
    });

    it('3. MAINTENANCE -> AVAILABLE (Workshop repairs completed)', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/transition`)
        .send({ status: 'AVAILABLE', reason: 'Repairs completed and tested' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('AVAILABLE');
    });
  });

  describe('Cancellation Flow & Scheduled Service', () => {
    it('RESERVED -> AVAILABLE (Reservation cancellation)', async () => {
      await request(app).post(`/api/vehicles/${vehicleId}/transition`).send({ status: 'RESERVED' });

      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/transition`)
        .send({ status: 'AVAILABLE', reason: 'Customer cancelled booking' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('AVAILABLE');
    });

    it('AVAILABLE -> MAINTENANCE -> AVAILABLE (Routine service)', async () => {
      const mRes = await request(app)
        .post(`/api/vehicles/${vehicleId}/transition`)
        .send({ status: 'MAINTENANCE', reason: 'Routine 10,000 km oil service' });
      expect(mRes.statusCode).toBe(200);
      expect(mRes.body.data.status).toBe('MAINTENANCE');

      const aRes = await request(app)
        .post(`/api/vehicles/${vehicleId}/transition`)
        .send({ status: 'AVAILABLE', reason: 'Service finished' });
      expect(aRes.statusCode).toBe(200);
      expect(aRes.body.data.status).toBe('AVAILABLE');
    });
  });

  describe('Strict Rejection of Invalid Transitions (Hard Blocking)', () => {
    it('should reject MAINTENANCE -> RESERVED (Cannot book a car in maintenance)', async () => {
      // Put in MAINTENANCE
      await request(app).post(`/api/vehicles/${vehicleId}/transition`).send({ status: 'MAINTENANCE' });

      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/transition`)
        .send({ status: 'RESERVED' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid status transition from 'MAINTENANCE' to 'RESERVED'/i);
    });

    it('should reject MAINTENANCE -> RENTED (Cannot rent a car in maintenance)', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/transition`)
        .send({ status: 'RENTED' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject DAMAGED -> AVAILABLE (Must undergo maintenance first)', async () => {
      // Reset to DAMAGED
      await request(app).post(`/api/vehicles/${vehicleId}/transition`).send({ status: 'AVAILABLE' });
      await request(app).post(`/api/vehicles/${vehicleId}/transition`).send({ status: 'RESERVED' });
      await request(app).post(`/api/vehicles/${vehicleId}/transition`).send({ status: 'RENTED' });
      await request(app).post(`/api/vehicles/${vehicleId}/transition`).send({ status: 'RETURNED' });
      await request(app).post(`/api/vehicles/${vehicleId}/transition`).send({ status: 'DAMAGED' });

      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/transition`)
        .send({ status: 'AVAILABLE' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid status transition from 'DAMAGED' to 'AVAILABLE'/i);

      // Clean back to AVAILABLE
      await request(app).post(`/api/vehicles/${vehicleId}/transition`).send({ status: 'MAINTENANCE' });
      await request(app).post(`/api/vehicles/${vehicleId}/transition`).send({ status: 'AVAILABLE' });
    });

    it('should reject RENTED -> AVAILABLE (Must pass RETURNED and INSPECTION)', async () => {
      await request(app).post(`/api/vehicles/${vehicleId}/transition`).send({ status: 'RESERVED' });
      await request(app).post(`/api/vehicles/${vehicleId}/transition`).send({ status: 'RENTED' });

      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/transition`)
        .send({ status: 'AVAILABLE' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);

      // Restore to AVAILABLE
      await request(app).post(`/api/vehicles/${vehicleId}/transition`).send({ status: 'RETURNED' });
      await request(app).post(`/api/vehicles/${vehicleId}/transition`).send({ status: 'INSPECTION' });
      await request(app).post(`/api/vehicles/${vehicleId}/transition`).send({ status: 'AVAILABLE' });
    });

    it('should reject same-state transition (e.g. AVAILABLE -> AVAILABLE)', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/transition`)
        .send({ status: 'AVAILABLE' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already in status 'AVAILABLE'/i);
    });

    it('should reject unknown invalid status string', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/transition`)
        .send({ status: 'FLYING_CAR' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/vehicles/:id/history', () => {
    it('should return complete chronological audit log of all transitions', async () => {
      const res = await request(app).get(`/api/vehicles/${vehicleId}/history`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('history');
      expect(Array.isArray(res.body.data.history)).toBe(true);
      expect(res.body.data.history.length).toBeGreaterThan(5);

      const latestEntry = res.body.data.history[0];
      expect(latestEntry).toHaveProperty('fromStatus');
      expect(latestEntry).toHaveProperty('toStatus');
      expect(latestEntry).toHaveProperty('timestamp');
      expect(latestEntry).toHaveProperty('reason');
    });
  });
});
