// Integration tests for Supabase RLS policies on core tables
// Tests: prompt_logs, comparisons, spark_logs for user, admin, anon roles
// Usage: Set SUPABASE_URL and appropriate keys in env before running

import { createClient } from '@supabase/supabase-js';
import { describe, it } from 'vitest';
import assert from 'assert';

describe('Supabase RLS Policies - Core Tables', () => {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  // Helper to create client with custom JWT or key
  function getClient(key, jwt) {
    return createClient(url, key, jwt ? { global: { headers: { Authorization: `Bearer ${jwt}` } } } : {});
  }

  // Replace with real JWTs for test users
  const userJwt = process.env.TEST_USER_JWT; // user_id matches test data
  const adminJwt = process.env.TEST_ADMIN_JWT; // role: admin
  const testUserId = process.env.TEST_USER_ID || 'test-user-id';

  it('User can only access their own prompt_logs', async () => {
    const supabase = getClient(anonKey, userJwt);
    const { data, error } = await supabase.from('prompt_logs').select('*');
    assert(!error, `User select error: ${error && error.message}`);
    assert(data.every(row => row.user_id === testUserId), 'User can only see their own rows');
  });

  it('Admin can access all prompt_logs', async () => {
    const supabase = getClient(anonKey, adminJwt);
    const { data, error } = await supabase.from('prompt_logs').select('*');
    assert(!error, `Admin select error: ${error && error.message}`);
    assert(data.length > 1, 'Admin should see multiple users\' rows');
  });

  it('Anon can only access public spark_logs', async () => {
    const supabase = getClient(anonKey);
    const { data, error } = await supabase.from('spark_logs').select('*');
    assert(!error, `Anon select error: ${error && error.message}`);
    assert(data.every(row => row.is_public === true), 'Anon can only see public rows');
  });

  it('User cannot access other users\' comparisons', async () => {
    const supabase = getClient(anonKey, userJwt);
    const { data, error } = await supabase.from('comparisons').select('*');
    assert(!error, `User select error: ${error && error.message}`);
    assert(data.every(row => row.user_id === testUserId), 'User can only see their own comparisons');
  });

  it('Admin can access all comparisons', async () => {
    const supabase = getClient(anonKey, adminJwt);
    const { data, error } = await supabase.from('comparisons').select('*');
    assert(!error, `Admin select error: ${error && error.message}`);
    assert(data.length > 1, 'Admin should see multiple users\' comparisons');
  });

  // Edge case: user tries to insert with mismatched user_id
  it('User cannot insert prompt_log for another user', async () => {
    const supabase = getClient(anonKey, userJwt);
    const { error } = await supabase.from('prompt_logs').insert({ user_id: 'other-user-id', prompt_text: 'test' });
    assert(error, 'Insert should fail for mismatched user_id');
  });

  // Edge case: admin can insert for any user
  it('Admin can insert prompt_log for any user', async () => {
    const supabase = getClient(anonKey, adminJwt);
    const { error } = await supabase.from('prompt_logs').insert({ user_id: 'any-user-id', prompt_text: 'admin insert' });
    assert(!error, 'Admin insert should succeed');
  });

  // Edge case: anon cannot insert
  it('Anon cannot insert prompt_log', async () => {
    const supabase = getClient(anonKey);
    const { error } = await supabase.from('prompt_logs').insert({ user_id: 'anon', prompt_text: 'anon insert' });
    assert(error, 'Anon insert should fail');
  });

  // Add more edge cases as needed
}); 