require('dotenv').config();
const request = require('supertest');
const { signToken } = require('../src/utils/jwt');
const app = require('../src/app');

describe('Reservation & Double-Booking Prevention API (/api/reservations)', () => {
  const mockUserId = '65f1a2b3c4d5e6f7a8b9c099';
  const targetVehicleId = '65f1a2b3c4d5e6f7a8b9c001'; // Creta in in-memory / seed store
  let authHeader;
  let createdReservationId;

  beforeAll(() => {
    const token = signToken({ id: mockUserId, email: 'customer@example.com', role: 'CUSTOMER' });
    authHeader = `Bearer ${token}`;
  });

  describe('POST /api/reservations - Date Validation', () => {
    it('should reject reservation when end date is equal to start date', async () => {
      const res = await request(app)
        .post('/api/reservations')
        .set('Authorization', authHeader)
        .send({
          vehicleId: targetVehicleId,
          startDate: '2026-10-10',
          endDate: '2026-10-10',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/End date must be strictly after start date/i);
    });

    it('should reject reservation when end date is before start date', async () => {
      const res = await request(app)
        .post('/api/reservations')
        .set('Authorization', authHeader)
        .send({
          vehicleId: targetVehicleId,
          startDate: '2026-10-15',
          endDate: '2026-10-10',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/End date must be strictly after start date/i);
    });

    it('should reject invalid date strings', async () => {
      const res = await request(app)
        .post('/api/reservations')
        .set('Authorization', authHeader)
        .send({
          vehicleId: targetVehicleId,
          startDate: 'invalid-date',
          endDate: '2026-10-15',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Invalid start or end date format/i);
    });
  });

  describe('POST /api/reservations - Double-Booking Prevention Logic', () => {
    it('should successfully create initial reservation (10 Oct -> 15 Oct)', async () => {
      const res = await request(app)
        .post('/api/reservations')
        .set('Authorization', authHeader)
        .send({
          vehicleId: targetVehicleId,
          startDate: '2026-10-10',
          endDate: '2026-10-15',
          notes: 'Initial test booking',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('reservationNumber');
      expect(res.body.data.status).toBe('CONFIRMED');
      expect(res.body.data.totalDays).toBe(5);

      createdReservationId = res.body.data._id;
    });

    it('should REJECT enclosed overlapping reservation (12 Oct -> 14 Oct)', async () => {
      const res = await request(app)
        .post('/api/reservations')
        .set('Authorization', authHeader)
        .send({
          vehicleId: targetVehicleId,
          startDate: '2026-10-12',
          endDate: '2026-10-14',
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toMatch(/already reserved/i);
    });

    it('should REJECT start-overlapping reservation (8 Oct -> 11 Oct)', async () => {
      const res = await request(app)
        .post('/api/reservations')
        .set('Authorization', authHeader)
        .send({
          vehicleId: targetVehicleId,
          startDate: '2026-10-08',
          endDate: '2026-10-11',
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toMatch(/already reserved/i);
    });

    it('should REJECT end-overlapping reservation (14 Oct -> 18 Oct)', async () => {
      const res = await request(app)
        .post('/api/reservations')
        .set('Authorization', authHeader)
        .send({
          vehicleId: targetVehicleId,
          startDate: '2026-10-14',
          endDate: '2026-10-18',
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toMatch(/already reserved/i);
    });

    it('should REJECT spanning overlapping reservation (8 Oct -> 18 Oct)', async () => {
      const res = await request(app)
        .post('/api/reservations')
        .set('Authorization', authHeader)
        .send({
          vehicleId: targetVehicleId,
          startDate: '2026-10-08',
          endDate: '2026-10-18',
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toMatch(/already reserved/i);
    });

    it('should ALLOW non-overlapping reservation AFTER existing (16 Oct -> 20 Oct)', async () => {
      const res = await request(app)
        .post('/api/reservations')
        .set('Authorization', authHeader)
        .send({
          vehicleId: targetVehicleId,
          startDate: '2026-10-16',
          endDate: '2026-10-20',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should ALLOW non-overlapping reservation BEFORE existing (5 Oct -> 9 Oct)', async () => {
      const res = await request(app)
        .post('/api/reservations')
        .set('Authorization', authHeader)
        .send({
          vehicleId: targetVehicleId,
          startDate: '2026-10-05',
          endDate: '2026-10-09',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/reservations & /api/reservations/my', () => {
    it('should return list of user reservations', async () => {
      const res = await request(app)
        .get('/api/reservations/my')
        .set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    });

    it('should fetch single reservation details by ID', async () => {
      const res = await request(app)
        .get(`/api/reservations/${createdReservationId}`)
        .set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(createdReservationId);
    });
  });

  describe('PATCH /api/reservations/:id/cancel', () => {
    it('should cancel active reservation', async () => {
      const res = await request(app)
        .patch(`/api/reservations/${createdReservationId}/cancel`)
        .set('Authorization', authHeader)
        .send({ reason: 'Plans changed' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('CANCELLED');
    });

    it('should reject cancelling an already cancelled reservation', async () => {
      const res = await request(app)
        .patch(`/api/reservations/${createdReservationId}/cancel`)
        .set('Authorization', authHeader)
        .send({ reason: 'Cancel again' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already cancelled/i);
    });
  });
});
