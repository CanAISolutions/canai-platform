/* eslint-env jest */
import request from 'supertest';
import app from '../../server.js';

describe('Emotional Analysis API', () => {
  it('POST /v1/analyze-emotion returns 200 and valid response', async () => {
    const res = await request(app)
      .post('/v1/analyze-emotion')
      .send({ text: 'This is a warm and inviting business plan', comparisonId: '123e4567-e89b-12d3-a456-426614174000' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('arousal');
    expect(res.body).toHaveProperty('valence');
    expect(res.body).toHaveProperty('confidence');
    expect(['hume', 'gpt4o']).toContain(res.body.source);
    expect(res.body.error).toBeNull();
  });

  it('POST /v1/analyze-emotion returns 400 on invalid input', async () => {
    const res = await request(app)
      .post('/v1/analyze-emotion')
      .send({ text: '', comparisonId: 'not-a-uuid' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('GET /v1/analyze-emotion/status returns 200 and status', async () => {
    const res = await request(app)
      .get('/v1/analyze-emotion/status');
    expect(res.statusCode).toBe(200);
    expect(['operational', 'degraded']).toContain(res.body.status);
    expect(['CLOSED', 'OPEN', 'HALF_OPEN', 'UNKNOWN']).toContain(res.body.circuitBreakerState);
    expect(res.body.error).toBeNull();
  });
}); 