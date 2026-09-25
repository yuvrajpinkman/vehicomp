require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const { Vehicle } = require('../src/models/Vehicle');
const { LocationLog } = require('../src/models/Location');

describe('Stage 7 — Location Tracking & Telematics Test Suite', () => {
  let testVehicle;
  const testReg = `LOC-TEST-${Date.now().toString().slice(-6)}`;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicomp';
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    }

    // Create a known vehicle for location tests
    testVehicle = await Vehicle.create({
      registrationNumber: testReg,
      make: 'Mahindra',
      model: 'Scorpio-N',
      year: 2024,
      vehicleType: 'SUV',
      fuelType: 'DIESEL',
      pricePerDay: 3500,
      condition: 'EXCELLENT',
      status: 'RENTED',
      location: {
        city: 'Hyderabad',
        address: 'Banjara Hills',
        coordinates: { latitude: 17.4156, longitude: 78.4350 },
      },
    });
  });

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      if (testVehicle) {
        await LocationLog.deleteMany({ vehicle: testVehicle._id });
        await Vehicle.deleteOne({ _id: testVehicle._id });
      }
    }
  });

  describe('1. Location Ingestion & Validation', () => {
    it('should reject coordinates update missing latitude or longitude with 400', async () => {
      const res = await request(app)
        .post('/api/location/update')
        .send({ vehicleId: testVehicle._id, speed: 40 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid latitude (> 90) with 400', async () => {
      const res = await request(app)
        .post('/api/location/update')
        .send({ vehicleId: testVehicle._id, latitude: 95.0, longitude: 78.4 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid longitude (> 180) with 400', async () => {
      const res = await request(app)
        .post('/api/location/update')
        .send({ vehicleId: testVehicle._id, latitude: 17.4, longitude: 195.0 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should record valid telematics coordinate update and persist in DB', async () => {
      const payload = {
        vehicleId: testVehicle._id,
        latitude: 17.4200,
        longitude: 78.4400,
        speed: 48,
        heading: 120,
        status: 'MOVING',
        batteryLevel: 98,
        fuelLevel: 82,
        odometer: 14500,
        address: 'Road No. 12, Banjara Hills',
      };

      const res = await request(app).post('/api/location/update').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.latitude).toBe(17.4200);
      expect(res.body.data.longitude).toBe(78.4400);
      expect(res.body.data.speed).toBe(48);

      // Verify Vehicle coordinates were updated
      const updatedVehicle = await Vehicle.findById(testVehicle._id);
      expect(updatedVehicle.location.coordinates.latitude).toBe(17.4200);
      expect(updatedVehicle.location.coordinates.longitude).toBe(78.4400);
    });
  });

  describe('2. Telematics Query Endpoints', () => {
    it('GET /api/location/vehicle/:vehicleId should return current telemetry and details', async () => {
      const res = await request(app).get(`/api/location/vehicle/${testVehicle._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('latitude');
      expect(res.body.data).toHaveProperty('longitude');
      expect(res.body.data).toHaveProperty('speed');
      expect(res.body.data).toHaveProperty('vehicleDetails');
      expect(res.body.data.vehicleDetails.registrationNumber).toBe(testReg);
    });

    it('GET /api/location/vehicle/:vehicleId/history should return breadcrumb logs', async () => {
      // Add a second log entry
      await request(app).post('/api/location/update').send({
        vehicleId: testVehicle._id,
        latitude: 17.4250,
        longitude: 78.4450,
        speed: 52,
        status: 'MOVING',
      });

      const res = await request(app).get(`/api/location/vehicle/${testVehicle._id}/history`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/location/fleet should return telemetry coordinates for all active fleet vehicles', async () => {
      const res = await request(app).get('/api/location/fleet');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const target = res.body.data.find((v) => v.registrationNumber === testReg);
      expect(target).toBeDefined();
      expect(target).toHaveProperty('latitude');
      expect(target).toHaveProperty('longitude');
      expect(target).toHaveProperty('speed');
      expect(target).toHaveProperty('telemetryStatus');
    });
  });

  describe('3. Simulated Movement Engine', () => {
    it('POST /api/location/simulate/:vehicleId should advance vehicle position along trajectory', async () => {
      const initialRes = await request(app).get(`/api/location/vehicle/${testVehicle._id}`);
      const initialLat = initialRes.body.data.latitude;
      const initialLng = initialRes.body.data.longitude;

      const simRes = await request(app)
        .post(`/api/location/simulate/${testVehicle._id}`)
        .send({ stepSize: 0.002 });

      expect(simRes.status).toBe(200);
      expect(simRes.body.success).toBe(true);
      expect(simRes.body.data.status).toBe('MOVING');
      expect(simRes.body.data.speed).toBeGreaterThan(0);

      // Verify coordinate changed
      const newLat = simRes.body.data.latitude;
      const newLng = simRes.body.data.longitude;
      const moved = newLat !== initialLat || newLng !== initialLng;
      expect(moved).toBe(true);
    });
  });
});
