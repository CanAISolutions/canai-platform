/* eslint-env jest */
import HumeService from '../../services/hume.js';
import KeyManagementService from '../../services/keyManagement.js';
import HumeCircuitBreaker from '../../middleware/hume.js';
import EmotionalScorer from '../../services/emotionalScoring.js';

jest.mock('../../supabase/client.js', () => ({
  __esModule: true,
  default: {
    from: jest.fn(() => ({
      upsert: jest.fn().mockResolvedValue({ data: {}, error: null }),
      update: jest.fn().mockResolvedValue({ data: {}, error: null })
    }))
  }
}));

describe('HumeService', () => {
  it('throws if HUME_API_KEY is missing', async () => {
    const original = process.env.HUME_API_KEY;
    delete process.env.HUME_API_KEY;
    const service = new HumeService();
    await expect(service.initialize()).rejects.toThrow('HUME_API_KEY is missing');
    process.env.HUME_API_KEY = original;
  });

  it('initializes and stores key in Supabase', async () => {
    process.env.HUME_API_KEY = 'test-key';
    const service = new HumeService();
    await expect(service.initialize()).resolves.toBeUndefined();
  });

  it('enforces rate limiting', async () => {
    process.env.HUME_API_KEY = 'test-key';
    const service = new HumeService();
    // Consume all points
    for (let i = 0; i < 100; i++) {
      await service.rateLimiter.consume(1);
    }
    await expect(service.rateLimiter.consume(1)).rejects.toThrow();
  });
});

describe('KeyManagementService', () => {
  it('rotates Hume API key and stores in Supabase', async () => {
    const kms = new KeyManagementService();
    const newKey = await kms.rotateHumeKey();
    expect(newKey).toBe('new_hume_api_key');
  });
});

describe('HumeCircuitBreaker', () => {
  jest.useFakeTimers();

  it('starts in CLOSED state', () => {
    const cb = new HumeCircuitBreaker();
    expect(cb.state).toBe('CLOSED');
    expect(cb.isOpen()).toBe(false);
  });

  it('transitions to OPEN after threshold failures', () => {
    const cb = new HumeCircuitBreaker();
    for (let i = 0; i < cb.FAILURE_THRESHOLD; i++) {
      cb.onFailure();
    }
    expect(cb.state).toBe('OPEN');
    expect(cb.isOpen()).toBe(true);
  });

  it('transitions to HALF_OPEN after reset timeout', () => {
    const cb = new HumeCircuitBreaker();
    for (let i = 0; i < cb.FAILURE_THRESHOLD; i++) {
      cb.onFailure();
    }
    expect(cb.state).toBe('OPEN');
    jest.advanceTimersByTime(cb.RESET_TIMEOUT + 1);
    expect(cb.shouldAttemptReset()).toBe(true);
  });

  it('resets to CLOSED on success in HALF_OPEN', () => {
    const cb = new HumeCircuitBreaker();
    cb.state = 'HALF_OPEN';
    cb.onSuccess();
    expect(cb.state).toBe('CLOSED');
    expect(cb.failures).toBe(0);
  });
});

describe('EmotionalScorer', () => {
  it('normalizes scores within 0-1', () => {
    const scorer = new EmotionalScorer();
    const raw = { arousal: 1.2, valence: -0.1, confidence: 0.95 };
    const norm = scorer.normalizeScore(raw);
    expect(norm.arousal).toBe(1);
    expect(norm.valence).toBe(0);
    expect(norm.confidence).toBe(0.95);
  });

  it('validates scores above threshold', () => {
    const scorer = new EmotionalScorer();
    const score = { arousal: 0.7, valence: 0.8, confidence: 0.9 };
    expect(scorer.validateScore(score)).toBe(true);
  });

  it('invalidates scores below threshold', () => {
    const scorer = new EmotionalScorer();
    const score = { arousal: 0.4, valence: 0.5, confidence: 0.9 };
    expect(scorer.validateScore(score)).toBe(false);
  });
});

describe('HumeService emotional scoring', () => {
  it('returns normalized and validated score', async () => {
    process.env.HUME_API_KEY = 'test-key';
    const service = new HumeService();
    const result = await service.analyzeEmotion('test', 'uuid');
    expect(result).toEqual({ arousal: 0.7, valence: 0.8, confidence: 0.9, source: 'hume' });
  });

  it('throws if score is below threshold', async () => {
    process.env.HUME_API_KEY = 'test-key';
    const service = new HumeService();
    // Patch scorer to return below-threshold score
    service.scorer.normalizeScore = () => ({ arousal: 0.4, valence: 0.5, confidence: 0.9 });
    await expect(service.analyzeEmotion('test', 'uuid')).rejects.toThrow('Emotional score below thresholds');
  });
});

describe('HumeService fallback logic', () => {
  it('uses fallback when circuit breaker is open', async () => {
    process.env.HUME_API_KEY = 'test-key';
    const service = new HumeService();
    service.circuitBreaker.isOpen = () => true;
    service.fallback.analyzeEmotion = jest.fn().mockResolvedValue({ arousal: 0.7, valence: 0.8, confidence: 0.9 });
    const result = await service.analyzeEmotion('test', 'uuid');
    expect(result).toEqual({ arousal: 0.7, valence: 0.8, confidence: 0.9, source: 'gpt4o' });
    expect(service.fallback.analyzeEmotion).toHaveBeenCalled();
  });

  it('uses fallback when score is below threshold', async () => {
    process.env.HUME_API_KEY = 'test-key';
    const service = new HumeService();
    service.circuitBreaker.isOpen = () => false;
    service.scorer.normalizeScore = () => ({ arousal: 0.4, valence: 0.5, confidence: 0.9 });
    service.fallback.analyzeEmotion = jest.fn().mockResolvedValue({ arousal: 0.7, valence: 0.8, confidence: 0.9 });
    const result = await service.analyzeEmotion('test', 'uuid');
    expect(result).toEqual({ arousal: 0.7, valence: 0.8, confidence: 0.9, source: 'gpt4o' });
    expect(service.fallback.analyzeEmotion).toHaveBeenCalled();
  });
}); 