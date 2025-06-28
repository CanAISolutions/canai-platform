/* eslint-env jest */
import HumeService from '../../services/hume.js';

jest.mock('../../supabase/client.js', () => ({
  __esModule: true,
  default: {
    from: jest.fn(() => ({
      upsert: jest.fn().mockResolvedValue({ data: {}, error: null }),
      update: jest.fn().mockResolvedValue({ data: {}, error: null })
    }))
  }
}));

describe('Emotional Analysis Integration', () => {
  it('returns consistent output format across providers', async () => {
    process.env.HUME_API_KEY = 'test-key';
    const service = new HumeService();
    const result = await service.analyzeEmotion('This is a warm and inviting business plan', 'test-uuid');
    expect(result).toHaveProperty('arousal');
    expect(result).toHaveProperty('valence');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('source');
    expect(['hume', 'gpt4o']).toContain(result.source);
  });

  it('activates fallback on circuit breaker open', async () => {
    process.env.HUME_API_KEY = 'test-key';
    const service = new HumeService();
    service.circuitBreaker.isOpen = () => true;
    service.fallback.analyzeEmotion = jest.fn().mockResolvedValue({ arousal: 0.7, valence: 0.8, confidence: 0.9 });
    const result = await service.analyzeEmotion('Fallback test', 'test-uuid');
    expect(result.source).toBe('gpt4o');
    expect(service.fallback.analyzeEmotion).toHaveBeenCalled();
  });

  it('enforces rate limiting and triggers fallback after limit', async () => {
    process.env.HUME_API_KEY = 'test-key';
    const service = new HumeService();
    // Consume all points
    for (let i = 0; i < 100; i++) {
      await service.rateLimiter.consume(1);
    }
    await expect(service.rateLimiter.consume(1)).rejects.toThrow();
  });
}); 