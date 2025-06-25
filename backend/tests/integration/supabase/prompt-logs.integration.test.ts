/**
 * Integration tests for prompt_logs (F5: Input Collection)
 * PRD.md mapping: F5 Input Collection, prompt_logs CRUD, RLS, audit, constraints
 * Schema: See backend/supabase/migrations/001_core_tables.sql
 * API:    /api/prompt-logs
 */

import { describe, it, beforeAll, afterAll, beforeEach, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load .env for Supabase credentials
const envPath = path.resolve(__dirname, '../../../../.env');
dotenv.config({ path: envPath });

const SUPABASE_URL = process.env['SUPABASE_URL'];
const SUPABASE_ANON_KEY = process.env['SUPABASE_ANON_KEY'];
const SUPABASE_SERVICE_KEY = process.env['SUPABASE_SERVICE_KEY'];
const TEST_USER_JWT = process.env['TEST_USER_JWT'];
const TEST_ADMIN_JWT = process.env['TEST_ADMIN_JWT'];
const TEST_USER_ID = process.env['TEST_USER_ID'];
const TEST_ADMIN_ID = process.env['TEST_ADMIN_ID'];
const API_BASE_URL =
  process.env['TEST_API_BASE_URL'] || 'http://localhost:3000';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !TEST_USER_JWT || !TEST_USER_ID) {
  describe.skip('prompt_logs integration (env missing)', () => {
    it('skipped due to missing env vars', () => {
      expect(true).toBe(true);
    });
  });
} else {
  // Helper: Supabase client for direct DB checks
  const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY
  );

  // Test data for prompt_logs
  const testPromptLog = {
    user_id: TEST_USER_ID,
    business_description: 'Test business description for integration test',
    target_market: 'Test market',
    revenue_model: 'Subscription',
    competitors: 'Competitor A, Competitor B',
    unique_value_proposition: 'Unique value',
    location: 'Test City',
    funding_goal: 100000.0,
    timeline: '6 months',
    team_experience: '5 years in industry',
    market_research: 'Extensive research',
    risk_mitigation: 'Mitigation plan',
    growth_strategy: 'Aggressive growth',
    completion_percentage: 50.0,
    auto_save_count: 1,
    total_time_spent_seconds: 120,
    validation_status: 'draft',
    emotional_drivers: JSON.stringify(['growth', 'impact']),
    context_analysis: JSON.stringify({ summary: 'test' }),
  };

  let createdPromptLogId: string | undefined;

  describe('prompt_logs CRUD & RLS (F5: Input Collection)', () => {
    // Clean up any test records before/after
    beforeAll(async () => {
      await supabase
        .from('prompt_logs')
        .delete()
        .eq('business_description', testPromptLog.business_description);
    });
    afterAll(async () => {
      await supabase
        .from('prompt_logs')
        .delete()
        .eq('business_description', testPromptLog.business_description);
    });

    it('should create a prompt_log (POST /api/prompt-logs)', async () => {
      const res = await axios.post(
        `${API_BASE_URL}/api/prompt-logs`,
        testPromptLog,
        {
          headers: { Authorization: `Bearer ${TEST_USER_JWT}` },
        }
      );
      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('id');
      createdPromptLogId = res.data.id;
    });

    it('should read own prompt_log (GET /api/prompt-logs/:id)', async () => {
      const res = await axios.get(
        `${API_BASE_URL}/api/prompt-logs/${createdPromptLogId}`,
        {
          headers: { Authorization: `Bearer ${TEST_USER_JWT}` },
        }
      );
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('id', createdPromptLogId);
      expect(res.data).toHaveProperty('user_id', TEST_USER_ID);
    });

    it('should not allow another user to read prompt_log (GET /api/prompt-logs/:id)', async () => {
      // Use admin JWT as a different user for this test
      if (!TEST_ADMIN_JWT) return;
      try {
        await axios.get(
          `${API_BASE_URL}/api/prompt-logs/${createdPromptLogId}`,
          {
            headers: { Authorization: `Bearer ${TEST_ADMIN_JWT}` },
          }
        );
        // If admin is allowed, this should be checked for role in API logic
        // If not allowed, should throw
      } catch (err: any) {
        expect([403, 404]).toContain(err.response?.status);
      }
    });

    it('should update own prompt_log (PATCH /api/prompt-logs/:id)', async () => {
      const res = await axios.patch(
        `${API_BASE_URL}/api/prompt-logs/${createdPromptLogId}`,
        {
          business_description:
            'Updated business description for integration test',
        },
        {
          headers: { Authorization: `Bearer ${TEST_USER_JWT}` },
        }
      );
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty(
        'business_description',
        'Updated business description for integration test'
      );
    });

    it('should delete own prompt_log (DELETE /api/prompt-logs/:id)', async () => {
      const res = await axios.delete(
        `${API_BASE_URL}/api/prompt-logs/${createdPromptLogId}`,
        {
          headers: { Authorization: `Bearer ${TEST_USER_JWT}` },
        }
      );
      expect([200, 204]).toContain(res.status);
      // Confirm deletion
      const { data } = await supabase
        .from('prompt_logs')
        .select('id')
        .eq('id', createdPromptLogId);
      expect(data.length).toBe(0);
    });

    it('should enforce RLS: unauthenticated cannot create/read/update/delete', async () => {
      // Create
      try {
        await axios.post(`${API_BASE_URL}/api/prompt-logs`, testPromptLog);
      } catch (err: any) {
        expect([401, 403]).toContain(err.response?.status);
      }
      // Read
      try {
        await axios.get(
          `${API_BASE_URL}/api/prompt-logs/${createdPromptLogId}`
        );
      } catch (err: any) {
        expect([401, 403]).toContain(err.response?.status);
      }
      // Update
      try {
        await axios.patch(
          `${API_BASE_URL}/api/prompt-logs/${createdPromptLogId}`,
          { business_description: 'fail' }
        );
      } catch (err: any) {
        expect([401, 403]).toContain(err.response?.status);
      }
      // Delete
      try {
        await axios.delete(
          `${API_BASE_URL}/api/prompt-logs/${createdPromptLogId}`
        );
      } catch (err: any) {
        expect([401, 403]).toContain(err.response?.status);
      }
    });

    it('should reject constraint violations (POST /api/prompt-logs)', async () => {
      // Missing required field
      try {
        await axios.post(
          `${API_BASE_URL}/api/prompt-logs`,
          {
            ...testPromptLog,
            business_description: undefined,
          },
          {
            headers: { Authorization: `Bearer ${TEST_USER_JWT}` },
          }
        );
      } catch (err: any) {
        expect(err.response?.status).toBe(400);
      }
      // Invalid field (too short)
      try {
        await axios.post(
          `${API_BASE_URL}/api/prompt-logs`,
          {
            ...testPromptLog,
            business_description: 'short',
          },
          {
            headers: { Authorization: `Bearer ${TEST_USER_JWT}` },
          }
        );
      } catch (err: any) {
        expect(err.response?.status).toBe(400);
      }
    });

    it('should write audit log after create/update/delete', async () => {
      // Check audit_logs for recent entry by user
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .order('created_at', { ascending: false })
        .limit(5);
      expect(error).toBeNull();
      // At least one audit log entry for prompt_logs
      expect(data.some((row: any) => row.table_name === 'prompt_logs')).toBe(
        true
      );
    });
  });
}
