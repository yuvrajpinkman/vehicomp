require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { Vehicle } = require('../src/models/Vehicle');
const { Maintenance } = require('../src/models/Maintenance');
const Reservation = require('../src/models/Reservation');
const Rental = require('../src/models/Rental');
const { Invoice } = require('../src/models/Invoice');
const { LocationLog } = require('../src/models/Location');

describe('Stage 8 — Complete Fleet Module Testing & End-to-End Integration', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_12345';

  // Helper token generators
  const adminToken = jwt.sign(
    { id: new mongoose.Types.ObjectId().toString(), role: 'ADMIN', email: 'admin@vehicomp.com' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const employeeToken = jwt.sign(
    { id: new mongoose.Types.ObjectId().toString(), role: 'EMPLOYEE', email: 'employee@vehicomp.com' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const customerToken = jwt.sign(
    { id: new mongoose.Types.ObjectId().toString(), role: 'CUSTOMER', email: 'customer@gmail.com' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const expiredToken = jwt.sign(
    { id: new mongoose.Types.ObjectId().toString(), role: 'ADMIN', email: 'expired@vehicomp.com' },
    JWT_SECRET,
    { expiresIn: '-10s' } // Expired token
  );

  let e2eVehicle;
  const testReg = `E2E-TEST-${Date.now().toString().slice(-6)}`;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicomp';
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      if (e2eVehicle) {
        await LocationLog.deleteMany({ vehicle: e2eVehicle._id });
        await Maintenance.deleteMany({ vehicle: e2eVehicle._id });
        await Reservation.deleteMany({ vehicle: e2eVehicle._id });
        await Rental.deleteMany({ vehicle: e2eVehicle._id });
        await Vehicle.deleteOne({ _id: e2eVehicle._id });
      }
      await Vehicle.deleteMany({ registrationNumber: /^E2E-/ });
    }
  });

  describe('1. Fleet Authorization & RBAC Security Controls', () => {
    it('should reject unauthenticated requests to protected fleet endpoints with 401', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('x-enforce-auth', 'true')
        .send({ make: 'Honda', model: 'City' });

      expect(res.status).toBe(401);
    });

    it('should reject requests with expired JWT token with 401', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${expiredToken}`)
        .send({ make: 'Honda', model: 'City' });

      expect(res.status).toBe(401);
    });

    it('should reject customer role attempting fleet administration with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          registrationNumber: 'E2E-CUST-FORBIDDEN',
          make: 'Honda',
          model: 'Amaze',
          year: 2023,
          vehicleType: 'SEDAN',
          fuelType: 'PETROL',
          pricePerDay: 1800,
          location: { city: 'Hyderabad' },
        });

      expect(res.status).toBe(403);
    });

    it('should allow ADMIN and EMPLOYEE roles to perform vehicle administration', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          registrationNumber: testReg,
          make: 'Hyundai',
          model: 'Tucson',
          year: 2024,
          vehicleType: 'SUV',
          fuelType: 'DIESEL',
          pricePerDay: 4200,
          condition: 'EXCELLENT',
          status: 'AVAILABLE',
          location: {
            city: 'Hyderabad',
            address: 'Madhapur Cyber Towers',
            coordinates: { latitude: 17.4504, longitude: 78.3808 },
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      e2eVehicle = res.body.data;
    });
  });

  describe('2. Negative Data Validation & Vehicle Integrity', () => {
    it('should reject duplicate vehicle registration numbers with 400 or 409', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          registrationNumber: testReg, // Already exists
          make: 'Hyundai',
          model: 'Tucson Duplicate',
          year: 2024,
          vehicleType: 'SUV',
          fuelType: 'DIESEL',
          pricePerDay: 4200,
          location: { city: 'Hyderabad' },
        });

      expect([400, 409]).toContain(res.status);
    });

    it('should reject invalid vehicle price (negative price) with 400', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          registrationNumber: `E2E-NEG-${Date.now().toString().slice(-4)}`,
          make: 'Toyota',
          model: 'Glanza',
          year: 2023,
          vehicleType: 'HATCHBACK',
          fuelType: 'PETROL',
          pricePerDay: -500, // Invalid negative
          location: { city: 'Hyderabad' },
        });

      expect(res.status).toBe(400);
    });

    it('should reject invalid vehicleType enum with 400', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          registrationNumber: `E2E-TYPE-${Date.now().toString().slice(-4)}`,
          make: 'Boeing',
          model: '747',
          year: 2023,
          vehicleType: 'AIRPLANE', // Invalid enum
          fuelType: 'PETROL',
          pricePerDay: 50000,
          location: { city: 'Hyderabad' },
        });

      expect(res.status).toBe(400);
    });
  });

  describe('3. Maintenance Auto-Lock & Customer Booking Prevention', () => {
    let maintenanceRecord;

    it('should create maintenance request and auto-lock vehicle status to MAINTENANCE', async () => {
      const res = await request(app)
        .post('/api/maintenance')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          vehicleId: e2eVehicle._id,
          serviceType: 'BRAKE_SERVICE',
          problemDescription: 'Brake pads worn, front rotor inspection needed',
          priority: 'HIGH',
          estimatedCost: 3500,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      maintenanceRecord = res.body.data;

      // Verify Vehicle status transitioned to MAINTENANCE
      const vehicleCheck = await Vehicle.findById(e2eVehicle._id);
      expect(vehicleCheck.status).toBe('MAINTENANCE');
    });

    it('should HARD-BLOCK customer reservation while vehicle is in MAINTENANCE', async () => {
      const res = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          vehicleId: e2eVehicle._id,
          startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        });

      expect(res.status).toBe(400);
      expect(res.body.message || res.body.error).toMatch(/available|maintenance|status/i);
    });

    it('should complete maintenance and unlock vehicle back to AVAILABLE', async () => {
      const res = await request(app)
        .patch(`/api/maintenance/${maintenanceRecord._id || maintenanceRecord.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'COMPLETED',
          actualCost: 3200,
          resolutionNotes: 'Brake pads replaced, test drive passed',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify Vehicle status is unlocked
      const vehicleCheck = await Vehicle.findById(e2eVehicle._id);
      expect(vehicleCheck.status).toBe('AVAILABLE');
    });
  });

  describe('4. End-to-End Rental, Revenue Dashboard & Recommendation Flow', () => {
    it('should recommend the unlocked vehicle with top match highlights', async () => {
      const res = await request(app)
        .get('/api/recommendations')
        .query({
          vehicleType: 'SUV',
          city: 'Hyderabad',
          minPrice: 3000,
          maxPrice: 6000,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const target = res.body.data.find((v) => v.registrationNumber === testReg);
      expect(target).toBeDefined();
      expect(target.status).toBe('AVAILABLE');
      expect(target.recommendationScore).toBeGreaterThan(60);
    });

    it('should track vehicle telematics coordinates and simulate movement tick', async () => {
      // 1. Ingest GPS telematics
      const updateRes = await request(app)
        .post('/api/location/update')
        .send({
          vehicleId: e2eVehicle._id,
          latitude: 17.4550,
          longitude: 78.3850,
          speed: 45,
          heading: 90,
          status: 'MOVING',
          batteryLevel: 94,
          fuelLevel: 80,
        });

      expect(updateRes.status).toBe(201);
      expect(updateRes.body.success).toBe(true);

      // 2. Advance simulated movement
      const simRes = await request(app)
        .post(`/api/location/simulate/${e2eVehicle._id}`)
        .send({ stepSize: 0.002 });

      expect(simRes.status).toBe(200);
      expect(simRes.body.data.status).toBe('MOVING');

      // 3. Confirm in fleet overview
      const fleetRes = await request(app).get('/api/location/fleet');
      expect(fleetRes.status).toBe(200);
      const vehicleTelematics = fleetRes.body.data.find((v) => v.registrationNumber === testReg);
      expect(vehicleTelematics).toBeDefined();
      expect(vehicleTelematics.speed).toBeGreaterThan(0);
    });

    it('should dynamically calculate fleet statistics & revenue on the Fleet Dashboard', async () => {
      const res = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('fleet');
      expect(res.body.data).toHaveProperty('revenue');
      expect(res.body.data.fleet.totalVehicles).toBeGreaterThan(0);
      expect(res.body.data.revenue).toHaveProperty('totalGrossRevenue');
      expect(res.body.data.revenue).toHaveProperty('totalMaintenanceCost');
      expect(res.body.data.revenue).toHaveProperty('netProfit');

      // Verify Net Profit = Gross Revenue - Maintenance Cost
      const { totalGrossRevenue, totalMaintenanceCost, netProfit } = res.body.data.revenue;
      expect(netProfit).toBe(totalGrossRevenue - totalMaintenanceCost);
    });
  });
});
