require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const { Vehicle } = require('../src/models/Vehicle');
const Rental = require('../src/models/Rental');
const Reservation = require('../src/models/Reservation');
const { Maintenance } = require('../src/models/Maintenance');

describe('Fleet Dashboard & Revenue Analytics API (/api/dashboard)', () => {
  let testVehicle;
  let testMaintenance;
  let testReservation;
  const testReg = `TEST-DASH-${Date.now().toString().slice(-6)}`;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicomp';
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    }

    // Seed a known test vehicle
    testVehicle = await Vehicle.create({
      registrationNumber: testReg,
      make: 'Tata',
      model: 'Harrier Dark',
      year: 2024,
      vehicleType: 'SUV',
      fuelType: 'DIESEL',
      pricePerDay: 3200,
      condition: 'EXCELLENT',
      status: 'AVAILABLE',
      location: { city: 'Hyderabad', address: 'Hitec City' },
    });

    // Seed a known maintenance record for this vehicle
    testMaintenance = await Maintenance.create({
      maintenanceNumber: `MNT-DASH-${Date.now().toString().slice(-5)}`,
      vehicle: testVehicle._id,
      serviceType: 'OIL_CHANGE',
      problemDescription: 'Routine synthetic oil change and filter',
      priority: 'LOW',
      status: 'COMPLETED',
      estimatedCost: 2000,
      actualCost: 1950,
      completionDate: new Date(),
    });

    // Seed a known reservation for this vehicle
    testReservation = await Reservation.create({
      reservationNumber: `RES-DASH-${Date.now().toString().slice(-5)}`,
      user: new mongoose.Types.ObjectId(),
      vehicle: testVehicle._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      totalDays: 3,
      pricePerDay: 3200,
      totalPrice: 9600,
      status: 'CONFIRMED',
    });
  });

  afterAll(async () => {
    if (testReservation?._id) await Reservation.findByIdAndDelete(testReservation._id);
    if (testMaintenance?._id) await Maintenance.findByIdAndDelete(testMaintenance._id);
    if (testVehicle?._id) await Vehicle.findByIdAndDelete(testVehicle._id);
    await mongoose.connection.close();
  });

  describe('GET /api/dashboard/stats - Live Fleet & Revenue Statistics', () => {
    it('should return complete fleet metrics computed dynamically from database', async () => {
      const res = await request(app).get('/api/dashboard/stats');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const { fleet, revenue, mostRentedVehicle } = res.body.data;

      // Fleet metrics
      expect(fleet).toBeDefined();
      expect(typeof fleet.totalVehicles).toBe('number');
      expect(fleet.totalVehicles).toBeGreaterThanOrEqual(1);
      expect(fleet.statusCounts).toHaveProperty('AVAILABLE');
      expect(fleet.statusCounts).toHaveProperty('MAINTENANCE');
      expect(fleet.statusCounts).toHaveProperty('RENTED');
      expect(fleet.typeBreakdown).toHaveProperty('SUV');
      expect(typeof fleet.utilizationRate).toBe('number');

      // Revenue metrics
      expect(revenue).toBeDefined();
      expect(typeof revenue.dailyRevenue).toBe('number');
      expect(typeof revenue.monthlyRevenue).toBe('number');
      expect(typeof revenue.totalGrossRevenue).toBe('number');
      expect(typeof revenue.totalMaintenanceCost).toBe('number');
      expect(revenue.totalMaintenanceCost).toBeGreaterThanOrEqual(1950);
      expect(revenue.netProfit).toBe(revenue.totalGrossRevenue - revenue.totalMaintenanceCost);

      // Most rented vehicle
      expect(mostRentedVehicle).toBeDefined();
      expect(mostRentedVehicle).toHaveProperty('vehicleId');
      expect(mostRentedVehicle).toHaveProperty('make');
      expect(mostRentedVehicle).toHaveProperty('model');
      expect(typeof mostRentedVehicle.totalTrips).toBe('number');
    });
  });

  describe('GET /api/dashboard/revenue-trend - 7-Day Revenue & Expense Timeline', () => {
    it('should return 7-day revenue vs maintenance trend data', async () => {
      const res = await request(app).get('/api/dashboard/revenue-trend?days=7');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(7);

      const daySample = res.body.data[0];
      expect(daySample).toHaveProperty('date');
      expect(daySample).toHaveProperty('day');
      expect(daySample).toHaveProperty('revenue');
      expect(daySample).toHaveProperty('maintenanceCost');
      expect(daySample).toHaveProperty('net');
    });
  });

  describe('GET /api/dashboard/performance - Vehicle Performance Leaderboard', () => {
    it('should return all fleet vehicles ranked by revenue and trips', async () => {
      const res = await request(app).get('/api/dashboard/performance');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);

      const topVehicle = res.body.data[0];
      expect(topVehicle).toHaveProperty('vehicleId');
      expect(topVehicle).toHaveProperty('registrationNumber');
      expect(topVehicle).toHaveProperty('totalTrips');
      expect(topVehicle).toHaveProperty('totalRevenueEarned');

      // Verify descending sort
      if (res.body.data.length > 1) {
        const first = res.body.data[0];
        const second = res.body.data[1];
        expect(first.totalRevenueEarned).toBeGreaterThanOrEqual(second.totalRevenueEarned);
      }
    });
  });
});
