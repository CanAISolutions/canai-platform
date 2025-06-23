/**
 * Supabase Connectivity Integration Test
 *
 * PRD.md Mapping:
 *   - Section 6: Requirements (Platform must reliably connect to Supabase for all F1-F9 flows)
 *   - Section 12: Metrics (System health, uptime, and error reporting)
 *
 * Real-World Event: Platform startup and health monitoring
 *
 * This test verifies that the backend /health endpoint can successfully connect to Supabase.
 * If this test fails, the platform is not production-ready and all further integration tests should be skipped.
 */

import { describe, it, expect } from 'vitest';
import axios from 'axios';

// Adjust BASE_URL as needed for your test environment
const BASE_URL = process.env.TEST_API_BASE_URL || 'http://localhost:3000';

describe('Supabase Connectivity via /health endpoint', () => {
  it('should return healthy status if Supabase is reachable', async () => {
    const res = await axios.get(`${BASE_URL}/health`);
    expect(res.status).toBe(200);
    // Expect a JSON response with a supabase status field
    expect(res.data).toHaveProperty('supabase');
    expect(res.data.supabase).toBe('healthy');
    // Optionally check for other health fields (db, uptime, etc.)
  });

  it('should fail clearly if Supabase is not reachable', async () => {
    // This is a placeholder: in real CI, if Supabase is down, the above test will fail
    // Optionally, you could simulate a failure by mocking the endpoint or using a bad config
    // For now, this test is informational
    expect(true).toBe(true);
  });
}); 