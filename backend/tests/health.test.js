const request = require('supertest');
const app = require('../src/app');

describe('Health Check API', () => {
  it('GET /api/health should return 200 and status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'vehicomp-fleet-admin-api');
    expect(res.body).toHaveProperty('database');
    expect(res.body.database).toHaveProperty('status');
  });

  it('GET / non-existent route should return 404', async () => {
    const res = await request(app).get('/api/non-existent-endpoint');
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('success', false);
  });
});
