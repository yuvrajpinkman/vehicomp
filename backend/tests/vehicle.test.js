require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const { Vehicle } = require('../src/models/Vehicle');

describe('Vehicle Management API (/api/vehicles)', () => {
  let createdVehicleId;
  const testReg = `TEST-${Date.now().toString().slice(-6)}`;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicomp';
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    }
  });

  afterAll(async () => {
    // Clean up test vehicles
    await Vehicle.deleteMany({ registrationNumber: new RegExp('^TEST-', 'i') });
    await mongoose.connection.close();
  });

  describe('POST /api/vehicles', () => {
    it('should create a new vehicle with valid data', async () => {
      const newVehicle = {
        registrationNumber: testReg,
        make: 'Hyundai',
        model: 'Creta',
        year: 2024,
        vehicleType: 'SUV',
        fuelType: 'PETROL',
        pricePerDay: 2800,
        condition: 'EXCELLENT',
        status: 'AVAILABLE',
        location: {
          city: 'Hyderabad',
          address: 'Hitec City, Madhapur',
        },
        seatingCapacity: 5,
      };

      const res = await request(app).post('/api/vehicles').send(newVehicle);
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.registrationNumber).toBe(testReg);
      expect(res.body.data.vehicleType).toBe('SUV');
      expect(res.body.data.pricePerDay).toBe(2800);
      expect(res.body.data.status).toBe('AVAILABLE');

      createdVehicleId = res.body.data._id;
    });

    it('should reject creation with duplicate registration number', async () => {
      const duplicate = {
        registrationNumber: testReg,
        make: 'Hyundai',
        model: 'Creta',
        year: 2024,
        vehicleType: 'SUV',
        fuelType: 'PETROL',
        pricePerDay: 2800,
        location: { city: 'Hyderabad' },
      };

      const res = await request(app).post('/api/vehicles').send(duplicate);
      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should reject creation with invalid vehicle type', async () => {
      const invalid = {
        registrationNumber: `TEST-INV-${Date.now().toString().slice(-4)}`,
        make: 'Tata',
        model: 'Nexon',
        year: 2023,
        vehicleType: 'TRUCK', // Invalid type
        fuelType: 'DIESEL',
        pricePerDay: 2000,
        location: { city: 'Hyderabad' },
      };

      const res = await request(app).post('/api/vehicles').send(invalid);
      expect(res.statusCode).toBe(500); // Mongoose validation error handled by global handler
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/vehicles', () => {
    it('should return a list of vehicles with pagination', async () => {
      const res = await request(app).get('/api/vehicles');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty('pagination');
    });

    it('should filter vehicles by vehicleType and status', async () => {
      const res = await request(app).get('/api/vehicles?vehicleType=SUV&status=AVAILABLE');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.forEach((v) => {
        expect(v.vehicleType).toBe('SUV');
        expect(v.status).toBe('AVAILABLE');
      });
    });

    it('should search vehicles by make or model', async () => {
      const res = await request(app).get('/api/vehicles?search=Creta');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.some((v) => v.model === 'Creta')).toBe(true);
    });
  });

  describe('GET /api/vehicles/:id', () => {
    it('should return vehicle details for a valid ID', async () => {
      const res = await request(app).get(`/api/vehicles/${createdVehicleId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(createdVehicleId);
      expect(res.body.data.registrationNumber).toBe(testReg);
    });

    it('should return 404 for a non-existent vehicle ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/vehicles/${fakeId}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/vehicles/:id', () => {
    it('should update vehicle details', async () => {
      const updateData = {
        pricePerDay: 3200,
        condition: 'GOOD',
      };

      const res = await request(app).put(`/api/vehicles/${createdVehicleId}`).send(updateData);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.pricePerDay).toBe(3200);
      expect(res.body.data.condition).toBe('GOOD');
    });
  });

  describe('PATCH /api/vehicles/:id/status', () => {
    it('should update vehicle status to a valid state', async () => {
      const res = await request(app)
        .patch(`/api/vehicles/${createdVehicleId}/status`)
        .send({ status: 'RESERVED' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('RESERVED');
    });

    it('should reject an invalid status', async () => {
      const res = await request(app)
        .patch(`/api/vehicles/${createdVehicleId}/status`)
        .send({ status: 'FLYING' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /api/vehicles/:id/deactivate', () => {
    it('should toggle vehicle isActive flag', async () => {
      const res = await request(app)
        .patch(`/api/vehicles/${createdVehicleId}/deactivate`)
        .send({ isActive: false });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isActive).toBe(false);
    });
  });

  describe('DELETE /api/vehicles/:id', () => {
    it('should soft delete vehicle', async () => {
      const res = await request(app).delete(`/api/vehicles/${createdVehicleId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      // Confirm vehicle is no longer returned in getVehicleById
      const checkRes = await request(app).get(`/api/vehicles/${createdVehicleId}`);
      expect(checkRes.statusCode).toBe(404);
    });
  });
});
