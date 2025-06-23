/**
 * Supabase .env Connectivity Test
 *
 * This test verifies that the Supabase client can connect using credentials from .env.
 * It is the lowest-level, most direct check of environment configuration and network access.
 *
 * PRD.md Mapping:
 *   - Section 6: Requirements (Platform must reliably connect to Supabase for all F1-F9 flows)
 *   - Section 12: Metrics (System health, uptime, and error reporting)
 */

import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

const SUPABASE_URL = process.env['SUPABASE_URL'];
const SUPABASE_ANON_KEY = process.env['SUPABASE_ANON_KEY'];

describe('Supabase .env connectivity (debug)', () => {
  it('should print debug info and connect to Supabase', async () => {
    // Debug output
    console.log('CWD:', process.cwd());
    console.log('.env path:', envPath);
    console.log('SUPABASE_URL:', SUPABASE_URL);
    console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'set' : 'not set');

    expect(SUPABASE_URL, 'SUPABASE_URL is not set in .env').toBeTruthy();
    expect(SUPABASE_ANON_KEY, 'SUPABASE_ANON_KEY is not set in .env').toBeTruthy();

    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
    const { data, error } = await supabase
      .from('prompt_logs')
      .select('id')
      .limit(1);
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
}); 