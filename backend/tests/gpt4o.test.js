/* eslint-disable no-undef */
import { describe, test, expect, beforeEach, vi } from 'vitest';

// Set environment variables
process.env.POSTHOG_API_KEY = 'test_posthog_key';
process.env.OPENAI_API_KEY = 'test_openai_key';
process.env.HUME_API_KEY = 'test_hume_key';

// Mock dependencies before any imports
const mockPostHogCapture = vi.fn();
const mockPostHogInstance = { capture: mockPostHogCapture };
vi.mock('posthog-node', () => ({
  PostHog: vi.fn(() => {
    console.log('PostHog mock instantiated');
    return mockPostHogInstance;
  }),
}));

const mockEncode = vi.fn((text) => {
  console.log('mockEncode called with:', text);
  return Array.from(text).map(c => c.charCodeAt(0));
});
const mockDecode = vi.fn((tokens) => {
  console.log('mockDecode called with:', tokens);
  return String.fromCharCode(...tokens);
});
const mockFree = vi.fn();
vi.mock('@dqbd/tiktoken', () => ({
  encoding_for_model: vi.fn(() => {
    console.log('tiktoken encoding_for_model mocked');
    return { encode: mockEncode, decode: mockDecode, free: mockFree };
  }),
}));

const mockSupabaseInsert = vi.fn().mockResolvedValue({});
const mockSupabaseSelect = vi.fn().mockReturnValue({
  data: [],
  eq: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
});
const mockSupabaseFrom = vi.fn(() => ({
  insert: mockSupabaseInsert,
  select: mockSupabaseSelect,
}));
const mockSupabaseRpc = vi.fn().mockResolvedValue({ data: 'test_openai_key', error: null });
vi.mock('../supabase/client.js', () => ({
  default: {
    from: mockSupabaseFrom,
    rpc: mockSupabaseRpc,
  },
}));

const mockSentryCapture = vi.fn();
vi.mock('@sentry/node', () => ({
  captureException: mockSentryCapture,
}));

const mockHumeAnalyze = vi.fn();
vi.mock('hume', () => ({
  HumeClient: vi.fn(() => ({
    language: { analyzeText: mockHumeAnalyze },
  })),
}));

describe('GPT4Service', () => {
  let GPT4Service;
  let service;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules(); // Reset module cache to ensure fresh mocks
    mockHumeAnalyze.mockReset().mockResolvedValue({
      predictions: [{ arousal: 0.8, valence: 0.9 }],
    });
    const module = await import('../services/gpt4o.js');
    GPT4Service = module.GPT4Service;
    service = new GPT4Service({
      from: mockSupabaseFrom,
      rpc: mockSupabaseRpc,
    }, mockPostHogInstance);
  });

  describe('Basic functionality', () => {
    test('countTokens returns correct token count for string', () => {
      const text = 'hello world';
      const result = service.countTokens(text);
      expect(mockEncode).toHaveBeenCalledWith(text);
      expect(result).toBe(11);
      expect(mockFree).toHaveBeenCalled();
    });

    test('chunkInput handles small input correctly', () => {
      const input = 'small test input';
      const chunks = service.chunkInput(input);
      expect(mockDecode).toHaveBeenCalledWith(expect.any(Array));
      expect(chunks.length).toBe(1);
      expect(chunks[0]).toBe(input);
      expect(mockFree).toHaveBeenCalled();
    });

    test('chunkInput prioritizes businessDescription and revenueModel', () => {
      const input = {
        businessDescription: 'Main business description',
        revenueModel: 'Revenue model details',
        other: 'Other information',
      };
      const chunks = service.chunkInput(input, 10000);
      const combined = chunks.join('');
      expect(mockDecode).toHaveBeenCalledWith(expect.any(Array));
      expect(combined).toContain('Main business description');
      expect(combined).toContain('Revenue model details');
      expect(combined).toContain('Other information');
      expect(mockFree).toHaveBeenCalled();
    });
  });

  describe('calculateCost', () => {
    test('logs to prompt_logs and triggers support_requests when cost exceeds $50', async () => {
      const params = {
        user_id: 'test-user',
        token_usage: 11_000_000,
        prompt_version: 'v1.0',
        prompt_type: 'business_plan',
      };
      const cost = await service.calculateCost(params);
      expect(cost).toBe(55);
      expect(mockSupabaseInsert).toHaveBeenCalledWith({
        user_id: 'test-user',
        token_usage: 11_000_000,
        cost: 55,
        prompt_version: 'v1.0',
      });
      expect(mockSupabaseInsert).toHaveBeenCalledWith({
        user_id: 'test-user',
        message: expect.stringContaining('exceeded'),
      });
      expect(mockPostHogCapture).toHaveBeenCalledWith('cost_threshold_exceeded', { cost: 55 });
    });

    test('does not trigger support_requests when cost is under $50', async () => {
      const params = {
        user_id: 'test-user',
        token_usage: 10_000_000,
        prompt_version: 'v1.0',
        prompt_type: 'social_media',
      };
      const cost = await service.calculateCost(params);
      expect(cost).toBe(50);
      expect(mockSupabaseInsert).toHaveBeenCalledTimes(1);
    });
  });

  describe('validateResponse', () => {
    beforeEach(() => {
      service.generate = vi.fn().mockResolvedValue('no');
    });

    test('validates response with high resonance and trustDelta', async () => {
      mockHumeAnalyze.mockResolvedValueOnce({
        predictions: [{ arousal: 0.8, valence: 0.9 }],
      });
      const response = 'Valid response with over 100 characters to meet completeness requirement for trust scoring purposes in a business plan context.';
      const result = await service.validateResponse(response, {
        promptType: 'business_plan',
        userId: 'test-user',
        trustDelta: 4.5,
      });
      expect(result.isValid).toBe(true);
      expect(result.trustScore).toBeGreaterThanOrEqual(50);
      expect(result.resonance.arousal).toBe(0.8);
      expect(result.resonance.valence).toBe(0.9);
      expect(result.issues).toHaveLength(0);
    });

    test('invalidates response with low resonance', async () => {
      mockHumeAnalyze.mockResolvedValueOnce({
        predictions: [{ arousal: 0.2, valence: 0.2 }],
      });
      const result = await service.validateResponse('Low resonance response with over 100 characters.', {
        promptType: 'business_plan',
        userId: 'test-user',
        trustDelta: 4.5,
      });
      expect(result.isValid).toBe(false);
      expect(result.trustScore).toBeLessThan(50);
      expect(result.issues).toContain('Emotional resonance below threshold');
    });

    test('invalidates response with low trustDelta', async () => {
      mockHumeAnalyze.mockResolvedValueOnce({
        predictions: [{ arousal: 0.8, valence: 0.9 }],
      });
      const result = await service.validateResponse('Low trustDelta response with over 100 characters.', {
        promptType: 'business_plan',
        userId: 'test-user',
        trustDelta: 3.0,
      });
      expect(result.isValid).toBe(false);
      expect(result.trustScore).toBeLessThan(50);
      expect(result.issues).toContain('TrustDelta below threshold');
    });

    test('detects toxic content', async () => {
      service.generate.mockImplementationOnce(async (prompt) => {
        console.log('Toxicity mock called with:', prompt);
        return 'yes';
      });
      const result = await service.validateResponse('Toxic content with over 100 characters for testing.', {
        promptType: 'business_plan',
        userId: 'test-user',
        trustDelta: 4.5,
      });
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Toxic content detected');
    });

    test('detects WCAG accessibility issues', async () => {
      const htmlWithIssues = '<img src="test.jpg"><a href="#">click here</a><div>content with over 100 characters for testing</div>';
      const result = await service.validateResponse(htmlWithIssues, {
        promptType: 'business_plan',
        userId: 'test-user',
        trustDelta: 4.5,
      });
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Missing alt text for image');
      expect(result.issues).toContain('Non-descriptive link text ("click here")');
      expect(result.issues).toContain('Missing semantic HTML structure');
    });

    test('falls back to GPT-4o when Hume AI fails', async () => {
      mockHumeAnalyze.mockRejectedValueOnce(new Error('Hume API down'));
      service.generate.mockImplementationOnce(async (prompt) => {
        console.log('Fallback mock called with:', prompt);
        return '{ "arousal": 0.75, "valence": 0.8 }';
      });
      const result = await service.validateResponse('Fallback test with over 100 characters.', {
        promptType: 'business_plan',
        userId: 'test-user',
        trustDelta: 4.5,
      });
      expect(result.resonance.arousal).toBe(0.75);
      expect(result.resonance.valence).toBe(0.8);
      expect(result.isValid).toBe(true);
    });

    test('logs validation results to comparisons table', async () => {
      mockHumeAnalyze.mockResolvedValueOnce({
        predictions: [{ arousal: 0.8, valence: 0.9 }],
      });
      const response = 'Logging test with over 100 characters for testing purposes.';
      await service.validateResponse(response, {
        promptType: 'business_plan',
        userId: 'test-user',
        trustDelta: 4.5,
      });
      expect(mockSupabaseInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'test-user',
          response,
          prompt_type: 'business_plan',
        })
      );
      expect(mockPostHogCapture).toHaveBeenCalledWith('gpt4o_quality', expect.any(Object));
    });
  });
});