---
description: 
globs: 
alwaysApply: true
---
# CanAI Supabase Rules

## Purpose
Ensure Supabase usage maintains data integrity, security, and GDPR/CCPA compliance for the CanAI Emotional Sovereignty Platform with comprehensive schema management, Row-Level Security (RLS), and performance optimization.

## Standards

### Schema Management
- **Migration Files**: Version all schemas in `databases/migrations/` with naming convention:
  - `YYYYMMDD_HHMMSS_table_name.sql` (e.g., `20250617_143000_prompt_logs.sql`)
  - Apply via `supabase/client.js` with rollback support
  - Include both UP and DOWN migrations for reversibility
- **Core Tables** (all with RLS policies):
  - `trust_indicators` - Trust metrics and testimonials
  - `pricing` - Product pricing configurations
  - `session_logs` - User interaction tracking
  - `initial_prompt_logs` - 2-step Discovery Funnel inputs
  - `spark_logs` - Spark generation and selection tracking
  - `payment_logs` - Stripe payment processing logs
  - `prompt_logs` - 12-field detailed input collection
  - `comparisons` - SparkSplit comparison results
  - `feedback_logs` - User feedback and ratings
  - `support_requests` - Customer support tickets
  - `error_logs` - Application error tracking
  - `share_logs` - Social sharing analytics
  - `usage_logs` - Platform usage metrics
  - `spark_cache` - Cached spark generation results

### Row-Level Security (RLS)
- **Mandatory RLS Policies**: All tables MUST enforce user-scoped access:
  ```sql
  -- Standard RLS pattern for user-scoped tables
  CREATE POLICY {table}_rls ON {table}
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);
  
  -- Example implementations:
  CREATE POLICY prompt_logs_rls ON prompt_logs
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);
  
  CREATE POLICY comparisons_rls ON comparisons
  FOR ALL TO authenticated
  USING (auth.uid() = (SELECT user_id FROM prompt_logs WHERE id = prompt_id));
  
  CREATE POLICY feedback_logs_rls ON feedback_logs
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);
  ```
- **Public Tables**: Only `trust_indicators`, `pricing`, and `spark_cache` allow public read access
- **Admin Access**: Separate admin policies for support and analytics access

### Index Strategy
- **Naming Convention**: `idx_{table}_{field(s)}` format
- **Performance Indexes** (target <50ms queries):
  ```sql
  -- User-scoped queries
  CREATE INDEX idx_prompt_logs_user_id ON prompt_logs(user_id);
  CREATE INDEX idx_session_logs_user_id ON session_logs(user_id);
  CREATE INDEX idx_feedback_logs_user_id ON feedback_logs(user_id);
  
  -- Analytics and performance
  CREATE INDEX idx_comparisons_trust_delta ON comparisons(trust_delta);
  CREATE INDEX idx_initial_prompt_logs_trust_score ON initial_prompt_logs(trust_score);
  CREATE INDEX idx_spark_logs_product_track ON spark_logs(product_track);
  
  -- Time-based queries
  CREATE INDEX idx_session_logs_created_at ON session_logs(created_at);
  CREATE INDEX idx_payment_logs_created_at ON payment_logs(created_at);
  
  -- Cache optimization
  CREATE INDEX idx_spark_cache_expires_at ON spark_cache(expires_at);
  ```

### Data Lifecycle Management
- **Automated Purging**: Implement `pg_cron` jobs for GDPR/CCPA compliance:
  ```sql
  -- databases/cron/purge.sql
  SELECT cron.schedule(
    'purge-inactive-data',
    '0 2 1 * *', -- Monthly at 2 AM
    $$DELETE FROM prompt_logs WHERE created_at < NOW() - INTERVAL '24 months'$$
  );
  
  SELECT cron.schedule(
    'purge-session-logs',
    '0 3 1 * *', -- Monthly at 3 AM
    $$DELETE FROM session_logs WHERE created_at < NOW() - INTERVAL '24 months'$$
  );
  ```
- **Anonymization Jobs**: Monthly anonymization for compliance:
  ```sql
  -- databases/cron/anonymize.sql
  SELECT cron.schedule(
    'anonymize-feedback',
    '0 4 1 * *', -- Monthly at 4 AM
    $$UPDATE feedback_logs SET user_feedback = '[ANONYMIZED]' 
      WHERE created_at < NOW() - INTERVAL '12 months'$$
  );
  ```
- **Cache Cleanup**: Automated cache expiration:
  ```sql
  -- databases/cron/cache_cleanup.sql
  SELECT cron.schedule(
    'cleanup-expired-cache',
    '0 * * * *', -- Hourly
    $$DELETE FROM spark_cache WHERE expires_at < NOW()$$
  );
  ```

### Client Configuration
- **Connection Setup** (`backend/supabase/client.js`):
  ```javascript
  import { createClient } from '@supabase/supabase-js';
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    realtime: {
      enabled: false // Disable for performance unless needed
    }
  });
  ```
- **Frontend Client** (`frontend/integrations/supabase/client.ts`):
  ```typescript
  import { createClient } from '@supabase/supabase-js';
  import type { Database } from './types';
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  ```

### Query Optimization
- **Batch Operations**: Use batch inserts for performance:
  ```javascript
  // Good: Batch insert session logs
  const sessionLogs = interactions.map(interaction => ({
    user_id: userId,
    interaction_type: interaction.type,
    details: interaction.details,
    created_at: new Date().toISOString()
  }));
  
  await supabase.from('session_logs').insert(sessionLogs);
  ```
- **Query Patterns**: Optimize for <50ms response times:
  ```javascript
  // User-scoped queries with proper indexing
  const { data: userPrompts } = await supabase
    .from('prompt_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);
  
  // Analytics queries with proper indexes
  const { data: trustMetrics } = await supabase
    .from('comparisons')
    .select('trust_delta, emotional_resonance')
    .gte('trust_delta', 4.0)
    .order('created_at', { ascending: false })
    .limit(100);
  ```

### Storage Configuration
- **Bucket Setup**: Organize file storage with proper access controls:
  - `plans/` - User deliverables (MemberStack-gated)
  - `samples/` - Public sample files
  - `uploads/` - Temporary user uploads
- **Access Policies**: RLS-based storage policies:
  ```sql
  -- Storage policies for user files
  CREATE POLICY "Users can upload their own files" ON storage.objects
  FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
  
  CREATE POLICY "Users can view their own files" ON storage.objects
  FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);
  ```

### Backup Strategy
- **Automated Backups**: Daily Supabase dashboard backups with 30-day retention
- **Point-in-Time Recovery**: Enable for critical data tables
- **Backup Validation**: Weekly backup restoration tests
- **Disaster Recovery**: Cross-region backup replication for production

### Monitoring & Analytics
- **Performance Monitoring**: Track query performance via PostHog:
  ```javascript
  // Log slow queries
  const startTime = performance.now();
  const result = await supabase.from('prompt_logs').select('*');
  const duration = performance.now() - startTime;
  
  if (duration > 100) {
    posthog.capture('slow_query', {
      table: 'prompt_logs',
      duration_ms: duration,
      query_type: 'select'
    });
  }
  ```
- **Error Tracking**: Sentry integration for database errors:
  ```javascript
  try {
    await supabase.from('prompt_logs').insert(data);
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        component: 'supabase',
        operation: 'insert',
        table: 'prompt_logs'
      }
    });
  }
  ```

### Development Workflow
- **Local Development**: Use Supabase CLI for local development:
  ```bash
  supabase start
  supabase migration new add_new_table
  supabase db push
  ```
- **Testing**: Comprehensive test coverage for RLS and queries:
  ```javascript
  // backend/tests/supabase.test.js
  describe('RLS Policies', () => {
    test('Users can only access their own prompt_logs', async () => {
      const { data, error } = await supabase
        .from('prompt_logs')
        .select('*')
        .eq('user_id', 'different-user-id');
      
      expect(data).toHaveLength(0);
      expect(error).toBeNull();
    });
  });
  ```

## Validation

### CI/CD Integration
- **Migration Validation**: `.github/workflows/supabase.yml`:
  ```yaml
  - name: Validate Migrations
    run: |
      supabase db diff --schema public
      supabase test db
  ```
- **RLS Testing**: Automated RLS policy validation:
  ```yaml
  - name: Test RLS Policies
    run: npm run test:rls
  ```

### Performance Testing
- **Query Performance**: Ensure <50ms query times:
  ```javascript
  // backend/tests/performance.test.js
  test('prompt_logs queries under 50ms', async () => {
    const start = performance.now();
    await supabase.from('prompt_logs').select('*').limit(100);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(50);
  });
  ```

### Monitoring Events
- **PostHog Tracking**:
  - `database_query_slow` - Queries >100ms
  - `rls_policy_violation` - Unauthorized access attempts
  - `backup_completed` - Successful backup operations
  - `data_purged` - Automated data purging events
- **Sentry Monitoring**:
  - Connection failures
  - Query timeouts
  - RLS policy errors
  - Migration failures

## References
- **PRD Sections**: 8.4 (Database), 8.5 (Integrations), 8.6 (Monitoring)
- **Project Structure**: 
  - `databases/migrations/` - Schema versioning
  - `databases/cron/` - Automated jobs
  - `backend/supabase/client.js` - Server client
  - `frontend/integrations/supabase/` - Frontend integration
  - `backend/tests/supabase.test.js` - Test coverage

## Technical Notes
- Targets `databases/**/*`, `backend/supabase/**/*`, `frontend/integrations/supabase/**/*`
- Supports PRD stack: Supabase, PostgreSQL, MemberStack, Stripe, PostHog, Sentry
- PRD targets: <50ms queries, 99.9% uptime, GDPR/CCPA compliance, 24-month data retention
- Updated at 12:15 PM MDT, June 18, 2025, Version: 1.0.0





