require('dotenv').config();
const request = require('supertest');
const { signToken } = require('../src/utils/jwt');
const app = require('../src/app');
const pricingService = require('../src/services/pricing.service');
const invoiceService = require('../src/services/invoice.service');
const rentalService = require('../src/services/rental.service');
const vehicleService = require('../src/services/vehicle.service');

describe('Stage 6 — Pricing & Invoice Management', () => {
  const mockUserId = '65f1a2b3c4d5e6f7a8b9c099';
  let authHeader;
  let createdVehicle;
  let createdRental;

  beforeAll(async () => {
    const token = signToken({ id: mockUserId, email: 'customer@example.com', role: 'CUSTOMER' });
    authHeader = `Bearer ${token}`;

    createdVehicle = await vehicleService.createVehicle({
      make: 'BMW',
      model: 'i4 Electric',
      year: 2024,
      registrationNumber: `REG-${Date.now()}`,
      vehicleType: 'ELECTRIC',
      dailyRate: 150,
      pricePerDay: 150,
      fuelType: 'ELECTRIC',
      transmission: 'AUTOMATIC',
      seatingCapacity: 5,
      location: { city: 'Downtown Hub' },
      status: 'AVAILABLE',
    });

    createdRental = await rentalService.startRental(
      {
        vehicleId: createdVehicle._id || createdVehicle.id,
        expectedReturnDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        initialOdometer: 1000,
        notes: 'Stage 6 pricing test rental',
      },
      mockUserId
    );
  });

  describe('1. Pricing Service Logic', () => {
    it('should calculate base price correctly for 3 days', () => {
      const result = pricingService.calculatePricing({
        startDate: '2026-10-01',
        endDate: '2026-10-04',
        dailyRate: 100,
        isPeakSeason: false,
      });

      expect(result.totalDays).toBe(3);
      expect(result.basePrice).toBe(300);
      expect(result.subtotal).toBeGreaterThanOrEqual(300);
    });

    it('should calculate weekend surcharge for days spanning a weekend', () => {
      // 2026-10-02 (Fri) to 2026-10-05 (Mon) spans Sat (Oct 3) and Sun (Oct 4) -> 2 weekend days
      const result = pricingService.calculatePricing({
        startDate: '2026-10-02',
        endDate: '2026-10-05',
        dailyRate: 100,
        isPeakSeason: false,
      });

      expect(result.totalDays).toBe(3);
      expect(result.weekendDays).toBe(2);
      expect(result.weekendCharges).toBe(40); // 2 * (100 * 0.20)
    });

    it('should apply peak season surcharge when isPeakSeason is true', () => {
      const result = pricingService.calculatePricing({
        startDate: '2026-07-01',
        endDate: '2026-07-04',
        dailyRate: 100,
        isPeakSeason: true,
      });

      expect(result.isPeakSeason).toBe(true);
      expect(result.peakCharges).toBe(45); // 15% of 300 base price
    });

    it('should add insurance, additional driver, late fee, and damage charges to breakdown', () => {
      const result = pricingService.calculatePricing({
        startDate: '2026-10-01',
        endDate: '2026-10-03', // 2 days
        dailyRate: 100, // $200 base
        insurancePlan: 'PREMIUM', // $30/day * 2 = $60
        hasAdditionalDriver: true, // $15/day * 2 = $30
        lateHours: 2,
        hourlyLateFeeRate: 20, // $40 late fee
        damageCharges: 100, // $100 damage
        discount: 20,
        isPeakSeason: false,
      });

      expect(result.basePrice).toBe(200);
      expect(result.insuranceFee).toBe(60);
      expect(result.additionalDriverFee).toBe(30);
      expect(result.lateFee).toBe(40);
      expect(result.damageCharges).toBe(100);

      // Subtotal = 200 + 0 (weekend) + 0 (peak) + 60 + 30 + 40 + 100 = 430
      expect(result.subtotal).toBe(430);
      expect(result.taxAmount).toBe(43); // 10% of 430
      expect(result.totalAmount).toBe(453); // 430 + 43 - 20
    });
  });

  describe('2. Dynamic Pricing API (/api/pricing/calculate)', () => {
    it('should return 200 and breakdown from /api/pricing/calculate', async () => {
      const res = await request(app)
        .post('/api/pricing/calculate')
        .send({
          startDate: '2026-10-10',
          endDate: '2026-10-13',
          dailyRate: 120,
          insurancePlan: 'BASIC',
          hasAdditionalDriver: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.totalDays).toBe(3);
      expect(res.body.data.basePrice).toBe(360);
      expect(res.body.data.insuranceFee).toBe(45); // $15 * 3
      expect(res.body.data.additionalDriverFee).toBe(45); // $15 * 3
    });
  });

  describe('3. Invoice Management APIs (/api/invoices)', () => {
    let generatedInvoiceId;

    it('should generate an invoice for an existing rental', async () => {
      const rentalId = createdRental._id || createdRental.id;
      const res = await request(app)
        .post('/api/invoices/generate')
        .set('Authorization', authHeader)
        .send({
          rentalId,
          insurancePlan: 'BASIC',
          hasAdditionalDriver: true,
          damageCharges: 50,
          notes: 'Stage 6 generated invoice test',
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.invoiceNumber).toMatch(/^INV-/);
      expect(res.body.data.pricingDetails.damageCharges).toBe(50);
      expect(res.body.data.status).toBe('ISSUED');

      generatedInvoiceId = res.body.data._id || res.body.data.id;
    });

    it('should fetch invoice details by ID', async () => {
      const res = await request(app)
        .get(`/api/invoices/${generatedInvoiceId}`)
        .set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data._id.toString()).toBe(generatedInvoiceId.toString());
    });

    it('should fetch invoice details by Rental ID', async () => {
      const rentalId = createdRental._id || createdRental.id;
      const res = await request(app)
        .get(`/api/invoices/rental/${rentalId}`)
        .set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.invoiceNumber).toBeDefined();
    });

    it('should fetch invoices list for customer', async () => {
      const res = await request(app)
        .get('/api/invoices')
        .set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should process invoice payment and change status to PAID', async () => {
      const res = await request(app)
        .post(`/api/invoices/${generatedInvoiceId}/pay`)
        .set('Authorization', authHeader)
        .send({
          paymentMethod: 'CREDIT_CARD',
          transactionId: 'TXN-STAGE6-TEST-999',
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.status).toBe('PAID');
      expect(res.body.data.paymentDetails.paymentStatus).toBe('PAID');
      expect(res.body.data.paymentDetails.paymentMethod).toBe('CREDIT_CARD');
      expect(res.body.data.paymentDetails.transactionId).toBe('TXN-STAGE6-TEST-999');
    });

    it('should reject paying an invoice that is already paid', async () => {
      const res = await request(app)
        .post(`/api/invoices/${generatedInvoiceId}/pay`)
        .set('Authorization', authHeader)
        .send({
          paymentMethod: 'DEBIT_CARD',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already been paid/i);
    });
  });
});
