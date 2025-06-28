// Seed Supabase test user and data for integration tests
// Usage: node scripts/seed-supabase-test-user.js

require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Config from env
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

if (!SUPABASE_URL || !SUPABASE_KEY || !SUPABASE_JWT_SECRET) {
  console.error('Missing SUPABASE_URL, SUPABASE_KEY, or SUPABASE_JWT_SECRET in env');
  process.exit(1);
}

const TEST_EMAIL = 'testuser+integration@example.com';
const TEST_PASSWORD = 'TestPassword123!';

async function main() {
  // 1. Register test user (idempotent)
  console.log('Registering test user...');
  let userId;
  try {
    // Try to sign up (will fail if user exists)
    const { data } = await axios.post(
      `${SUPABASE_URL}/auth/v1/signup`,
      { email: TEST_EMAIL, password: TEST_PASSWORD },
      { headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' } }
    );
    userId = data.user?.id;
    if (userId) {
      console.log('User registered:', userId);
    } else {
      throw new Error('No user id returned');
    }
  } catch (err) {
    // If user exists, fetch user id via admin API
    if (err.response && err.response.data?.msg?.includes('User already registered')) {
      console.log('User already exists, fetching user id...');
      // Use the admin API to list users (requires service_role key)
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!serviceKey) {
        console.error('User exists. Set SUPABASE_SERVICE_ROLE_KEY in env to fetch user id.');
        process.exit(1);
      }
      const { data } = await axios.get(
        `${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(TEST_EMAIL)}`,
        { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
      );
      userId = data.users?.[0]?.id;
      if (!userId) {
        console.error('Could not find user id for test user.');
        process.exit(1);
      }
      console.log('Fetched user id:', userId);
    } else {
      console.error('Error registering/fetching user:', err.message);
      process.exit(1);
    }
  }

  // 2. Generate JWT for test user
  const payload = { sub: userId, email: TEST_EMAIL };
  const testUserJwt = jwt.sign(payload, SUPABASE_JWT_SECRET, { expiresIn: '1h' });
  console.log('Generated JWT for test user.');

  // 3. Insert required rows into tables
  // Use Supabase REST API (PostgREST)
  const restHeaders = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates',
  };

  // Insert into prompt_logs
  const promptLogId = uuidv4();
  const promptLog = {
    id: promptLogId,
    user_id: userId,
    prompt_text: 'Test prompt',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  try {
    await axios.post(`${SUPABASE_URL}/rest/v1/prompt_logs`, [promptLog], { headers: restHeaders });
    console.log('Inserted prompt_logs row.');
  } catch (err) {
    if (err.response && err.response.status === 409) {
      console.log('prompt_logs row already exists.');
    } else {
      console.error('Error inserting prompt_logs:', err.message);
    }
  }

  // Insert into comparisons
  const comparison = {
    id: uuidv4(),
    prompt_log_id: promptLogId,
    user_id: userId,
    canai_output: 'output1',
    generic_output: 'output2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  try {
    await axios.post(`${SUPABASE_URL}/rest/v1/comparisons`, [comparison], { headers: restHeaders });
    console.log('Inserted comparisons row.');
  } catch (err) {
    if (err.response && err.response.status === 409) {
      console.log('comparisons row already exists.');
    } else {
      console.error('Error inserting comparisons:', err.message);
    }
  }

  // Insert into spark_logs
  const sparkLog = {
    id: uuidv4(),
    user_id: userId,
    is_public: true,
    generated_sparks: '[]',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  try {
    await axios.post(`${SUPABASE_URL}/rest/v1/spark_logs`, [sparkLog], { headers: restHeaders });
    console.log('Inserted spark_logs row.');
  } catch (err) {
    if (err.response && err.response.status === 409) {
      console.log('spark_logs row already exists.');
    } else {
      console.error('Error inserting spark_logs:', err.message);
    }
  }

  // 4. Output user id and JWT
  console.log('\nTest user seeded successfully!');
  console.log('TEST_USER_ID:', userId);
  console.log('TEST_USER_JWT:', testUserJwt);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
}); 