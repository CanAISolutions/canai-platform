import { createClient } from '@supabase/supabase-js';
import { testTable, testColumn, testIndex, testPolicy } from 'supatest';

// Set up your Supabase client (use env vars or test project keys)
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

describe('Supabase Schema & RLS', () => {
  // Schema checks
  testTable(supabase, 'prompt_logs');
  testColumn(supabase, 'prompt_logs', 'user_id');
  testIndex(supabase, 'prompt_logs', 'idx_prompt_logs_user_id_created_at');
  // ...repeat for all tables/columns/indexes

  // RLS policy checks (example)
  testPolicy(supabase, 'prompt_logs', 'user_access_policy_select');
  testPolicy(supabase, 'payment_logs', 'payment_logs_policy');
  // ...repeat for all policies
});