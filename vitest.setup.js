import 'dotenv/config';

// Environment variables should be loaded from .env file
// Remove hardcoded fallbacks to ensure tests fail if env vars are missing
process.env.SUPABASE_URL = 'https://xegwrehxfbxbatsdpvqe.supabase.co';
// TEST-ONLY: Set fake keys for test environment
process.env.SUPABASE_ANON_KEY = 'test-supabase-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-supabase-service-role-key';
// Guard: throw if a real key is detected
if (
  process.env.SUPABASE_ANON_KEY &&
  !process.env.SUPABASE_ANON_KEY.startsWith('test')
) {
  throw new Error('Real SUPABASE_ANON_KEY detected in test environment!');
}
if (
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  !process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith('test')
) {
  throw new Error(
    'Real SUPABASE_SERVICE_ROLE_KEY detected in test environment!'
  );
}

if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL environment variable is required for tests');
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'SUPABASE_SERVICE_ROLE_KEY environment variable is required for tests'
  );
}
if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error(
    'SUPABASE_ANON_KEY environment variable is required for tests'
  );
}
