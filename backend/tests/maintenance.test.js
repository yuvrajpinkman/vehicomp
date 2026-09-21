require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const { Vehicle } = require('../src/models/Vehicle');
const { Maintenance } = require('../src/models/Maintenance');
const { signToken } = require('../src/utils/jwt');

describe('Maintenance Management API (/api/maintenance)', () => {
  let vehicleId;
  let maintenanceId;
  let customerTokenHeader;
  const testReg = `TEST-MNT-${Date.now().toString().slice(-6)}`;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicomp';
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    }

    const token = signToken({ id: '65f1a2b3c4d5e6f7a8b9c099', email: 'customer@example.com', role: 'CUSTOMER' });
    customerTokenHeader = `Bearer ${token}`;

    // Create a pristine AVAILABLE vehicle
    const vehicle = await Vehicle.create({
      registrationNumber: testReg,
      make: 'Hyundai',
      model: 'Verna Turbo',
      year: 2024,
      vehicleType: 'SEDAN',
      fuelType: 'PETROL',
      pricePerDay: 2800,
      condition: 'EXCELLENT',
      status: 'AVAILABLE',
      location: { city: 'Hyderabad', address: 'Banjara Hills' },
    });
    vehicleId = vehicle._id.toString();
  });

  afterAll(async () => {
    await Maintenance.deleteMany({ vehicle: vehicleId });
    await Vehicle.deleteMany({ registrationNumber: new RegExp('^TEST-MNT-', 'i') });
    await mongoose.connection.close();
  });

  describe('GET /api/maintenance/meta', () => {
    it('should return allowed service types, priorities, and statuses', async () => {
      const res = await request(app).get('/api/maintenance/meta');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.serviceTypes).toContain('ROUTINE_SERVICE');
      expect(res.body.data.priorities).toContain('HIGH');
      expect(res.body.data.statuses).toContain('IN_PROGRESS');
    });
  });

  describe('POST /api/maintenance - Create Work Order & Auto Vehicle Transition', () => {
    it('should reject maintenance creation when problem description is missing', async () => {
      const res = await request(app)
        .post('/api/maintenance')
        .send({
          vehicleId,
          estimatedCost: 1500,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/problem description is required/i);
    });

    it('should reject maintenance creation when estimated cost is negative', async () => {
      const res = await request(app)
        .post('/api/maintenance')
        .send({
          vehicleId,
          problemDescription: 'Brake pads worn',
          estimatedCost: -500,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/non-negative estimated cost/i);
    });

    it('should reject maintenance with invalid priority', async () => {
      const res = await request(app)
        .post('/api/maintenance')
        .send({
          vehicleId,
          problemDescription: 'Brake pads worn',
          estimatedCost: 1500,
          priority: 'SUPER_URGENT',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/invalid priority/i);
    });

    it('should successfully create maintenance and auto-transition vehicle to MAINTENANCE', async () => {
      const res = await request(app)
        .post('/api/maintenance')
        .send({
          vehicleId,
          serviceType: 'BRAKE_SERVICE',
          problemDescription: 'Front brake rotor scoring and pad replacement',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          estimatedCost: 4500,
          serviceProvider: 'Bosch Auto Care Hyderabad',
          notes: 'Customer reported squeaking noise during drop-off',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('maintenanceNumber');
      expect(res.body.data.status).toBe('IN_PROGRESS');
      expect(res.body.data.estimatedCost).toBe(4500);

      maintenanceId = res.body.data._id;

      // Verify that the vehicle status was automatically moved to MAINTENANCE
      const vehRes = await request(app).get(`/api/vehicles/${vehicleId}`);
      expect(vehRes.statusCode).toBe(200);
      expect(vehRes.body.data.status).toBe('MAINTENANCE');
    });
  });

  describe('Reservation Blocking During Active Maintenance', () => {
    it('should strictly block customer reservation attempts while vehicle is under MAINTENANCE', async () => {
      const res = await request(app)
        .post('/api/reservations')
        .set('Authorization', customerTokenHeader)
        .send({
          vehicleId,
          startDate: '2026-11-01',
          endDate: '2026-11-05',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/under maintenance/i);
    });
  });

  describe('GET /api/maintenance - Query & Filter', () => {
    it('should retrieve all maintenance requests with populated vehicle', async () => {
      const res = await request(app).get('/api/maintenance');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.total).toBeGreaterThanOrEqual(1);
    });

    it('should filter maintenance requests by status', async () => {
      const res = await request(app).get('/api/maintenance?status=IN_PROGRESS');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.forEach((item) => {
        expect(item.status).toBe('IN_PROGRESS');
      });
    });

    it('should filter maintenance requests by priority', async () => {
      const res = await request(app).get('/api/maintenance?priority=HIGH');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.forEach((item) => {
        expect(item.priority).toBe('HIGH');
      });
    });

    it('should retrieve single maintenance record by ID', async () => {
      const res = await request(app).get(`/api/maintenance/${maintenanceId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id.toString()).toBe(maintenanceId.toString());
      expect(res.body.data.problemDescription).toContain('Front brake rotor');
    });
  });

  describe('GET /api/maintenance/stats - Aggregated Metrics', () => {
    it('should return aggregated cost and status statistics', async () => {
      const res = await request(app).get('/api/maintenance/stats');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('inProgress');
      expect(res.body.data).toHaveProperty('totalEstimatedCost');
      expect(res.body.data).toHaveProperty('byServiceType');
    });
  });

  describe('PUT /api/maintenance/:id - Update and Complete Workflow', () => {
    it('should update maintenance details (notes, actual cost, technician)', async () => {
      const res = await request(app)
        .put(`/api/maintenance/${maintenanceId}`)
        .send({
          performedBy: 'Master Tech Rajesh',
          actualCost: 4200,
          notes: 'New rotors fitted and bled with DOT 4 fluid',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.actualCost).toBe(4200);
      expect(res.body.data.performedBy).toBe('Master Tech Rajesh');
    });

    it('should complete maintenance and auto-release vehicle back to AVAILABLE', async () => {
      const res = await request(app)
        .put(`/api/maintenance/${maintenanceId}`)
        .send({
          status: 'COMPLETED',
          actualCost: 4200,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('COMPLETED');
      expect(res.body.data).toHaveProperty('completionDate');

      // Verify that the vehicle status was automatically released back to AVAILABLE
      const vehRes = await request(app).get(`/api/vehicles/${vehicleId}`);
      expect(vehRes.statusCode).toBe(200);
      expect(vehRes.body.data.status).toBe('AVAILABLE');

      // Verify statusHistory recorded the completion
      const histRes = await request(app).get(`/api/vehicles/${vehicleId}/history`);
      expect(histRes.statusCode).toBe(200);
      const latest = histRes.body.data.history[0];
      expect(latest.toStatus).toBe('AVAILABLE');
      expect(latest.fromStatus).toBe('MAINTENANCE');
    });
  });

  describe('Reservation Allowed After Maintenance Completion', () => {
    it('should now allow customer reservation since vehicle is AVAILABLE', async () => {
      const res = await request(app)
        .post('/api/reservations')
        .set('Authorization', customerTokenHeader)
        .send({
          vehicleId,
          startDate: '2026-11-10',
          endDate: '2026-11-14',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('CONFIRMED');
    });
  });

  describe('DELETE /api/maintenance/:id', () => {
    it('should delete a maintenance record', async () => {
      const res = await request(app).delete(`/api/maintenance/${maintenanceId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const check = await request(app).get(`/api/maintenance/${maintenanceId}`);
      expect(check.statusCode).toBe(404);
    });
  });
});
