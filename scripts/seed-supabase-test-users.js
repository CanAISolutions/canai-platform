// Seed Supabase test data for both regular and admin users for integration tests
// Usage: node scripts/seed-supabase-test-users.js

import 'dotenv/config';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in .env');
  process.exit(1);
}

const users = [
  {
    id: 'e250420b-c693-4ee8-83e6-f8269e6d4f93',
    email: 'mrbillwood@hotmail.com',
    label: 'Regular User',
  },
  {
    id: 'c90a5a82-30fb-41a9-a17f-8e1b5a75f176',
    email: 'mrbillwood@gmail.com',
    label: 'Admin User',
  },
];

const restHeaders = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'resolution=merge-duplicates',
};

async function seedUserData(user) {
  console.log(`\nSeeding data for ${user.label}: ${user.email}`);

  // Insert into prompt_logs (required: id, user_id, business_description, created_at, updated_at)
  const promptLogId = uuidv4();
  const promptLog = {
    id: promptLogId,
    user_id: user.id,
    business_description: `Test business description for ${user.label}`.padEnd(20, '.'), // min 10 chars
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  try {
    await axios.post(`${SUPABASE_URL}/rest/v1/prompt_logs`, [promptLog], { headers: restHeaders });
    console.log('Inserted prompt_logs row.');
  } catch (err) {
    if (err.response) {
      console.error('Error inserting prompt_logs:', err.response.data);
    } else {
      console.error('Error inserting prompt_logs:', err.message);
    }
  }

  // Insert into comparisons (required: id, prompt_log_id, user_id, canai_output, generic_output, created_at, updated_at)
  const comparison = {
    id: uuidv4(),
    prompt_log_id: promptLogId,
    user_id: user.id,
    canai_output: `output1 for ${user.label}`,
    generic_output: `output2 for ${user.label}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  try {
    await axios.post(`${SUPABASE_URL}/rest/v1/comparisons`, [comparison], { headers: restHeaders });
    console.log('Inserted comparisons row.');
  } catch (err) {
    if (err.response) {
      console.error('Error inserting comparisons:', err.response.data);
    } else {
      console.error('Error inserting comparisons:', err.message);
    }
  }

  // Insert into spark_logs (required: id, user_id, generated_sparks, status, created_at, updated_at)
  const sparkLogPayload = {
    id: uuidv4(),
    user_id: user.id,
    generated_sparks: JSON.stringify(['Test Spark 1', 'Test Spark 2']),
    status: 'generated',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  try {
    await axios.post(`${SUPABASE_URL}/rest/v1/spark_logs`, [sparkLogPayload], { headers: restHeaders });
    console.log('Inserted spark_logs row.');
  } catch (err) {
    if (err.response) {
      console.error('Error inserting spark_logs:', err.response.data);
    } else {
      console.error('Error inserting spark_logs:', err.message);
    }
  }
}

async function main() {
  for (const user of users) {
    await seedUserData(user);
  }
  console.log('\nSeeding complete!');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
}); 