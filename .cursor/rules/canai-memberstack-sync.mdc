---
description: 
globs: 
alwaysApply: true
---
# CanAI Memberstack Sync Rules

## Purpose
Synchronize user authentication, plan data, and subscription status between Memberstack and Supabase with data integrity, security, and seamless integration across CanAI's 9-stage user journey.

## Standards

### Change Detection & Tracking
- **Delta Tracking**: Track data changes via timestamps in `databases/user_logs`:
  ```sql
  CREATE TABLE user_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    change_type TEXT CHECK (change_type IN ('created', 'updated', 'deleted', 'synced')),
    old_data JSONB,
    new_data JSONB,
    source TEXT CHECK (source IN ('memberstack', 'supabase')),
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_user_logs_user_id (user_id),
    INDEX idx_user_logs_created_at (created_at)
  );
  ```
- **Webhook Events**: Monitor Memberstack events:
  - `member.created` - New user registration
  - `member.updated` - Profile or plan changes
  - `subscription.changed` - Subscription status updates
  - `member.deleted` - Account deletion
- **Sync Timestamps**: Maintain `last_synced_at` timestamps for conflict resolution

### Conflict Resolution Strategy
- **Data Authority**: Prioritize data sources based on context:
  - **Memberstack Authority**: User profile data, subscription status, authentication
  - **Supabase Authority**: Application-specific data, usage logs, project data
- **Conflict Handling**: Implement merge strategies for conflicting data:
  ```ts
  const resolveConflict = (memberstackData, supabaseData, conflictField) => {
    if (conflictField === 'email' || conflictField === 'subscription_status') {
      return memberstackData[conflictField]; // Memberstack wins
    }
    if (conflictField === 'project_data' || conflictField === 'usage_stats') {
      return supabaseData[conflictField]; // Supabase wins
    }
    // Timestamp-based resolution for other fields
    return memberstackData.updated_at > supabaseData.updated_at 
      ? memberstackData[conflictField] 
      : supabaseData[conflictField];
  };
  ```

### RLS Compliance & Security
- **Row-Level Security**: Enforce `auth.uid() = user_id` in all sync operations:
  ```sql
  -- Example RLS policy for user_logs
  CREATE POLICY user_logs_rls ON user_logs
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);
  ```
- **JWT Validation**: Validate Memberstack JWT for all sync operations (`backend/middleware/auth.js`):
  ```ts
  const validateMemberstackJWT = async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    try {
      const decoded = jwt.verify(token, process.env.MEMBERSTACK_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid JWT token' });
    }
  };
  ```
- **Data Scope**: Ensure all sync operations respect user boundaries and permissions

### Webhook Handler Implementation
- **Signature Verification**: Verify HMAC signatures for webhook authenticity:
  ```ts
  const verifyWebhookSignature = (payload, signature, secret) => {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  };
  ```
- **Idempotent Processing**: Prevent duplicate processing with unique event IDs:
  ```ts
  const processWebhook = async (eventId, eventData) => {
    // Check if already processed
    const existing = await supabase
      .from('webhook_log')
      .select('id')
      .eq('event_id', eventId)
      .single();
    
    if (existing.data) {
      return { status: 'already_processed' };
    }
    
    // Process webhook and log
    const result = await syncUserData(eventData);
    await logWebhookEvent(eventId, eventData, result);
    return result;
  };
  ```

### Error Handling & Reliability
- **Retry Logic**: Retry sync failures 3 times with exponential backoff:
  ```ts
  const retrySyncOperation = async (operation, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          await logSyncError(error, attempt);
          throw error;
        }
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };
  ```
- **Error Logging**: Log all sync failures to `databases/error_logs`:
  ```sql
  INSERT INTO error_logs (user_id, error_type, error_message, context, retry_count)
  VALUES ($1, 'sync_failed', $2, $3, $4);
  ```
- **Dead Letter Queue**: Route persistent failures for manual review

### Sync Operations
- **User Creation Sync**: Handle new Memberstack user registration:
  ```ts
  const syncNewUser = async (memberData) => {
    const userData = {
      id: memberData.id,
      email: memberData.email,
      subscription_status: memberData.planConnections?.[0]?.status || 'free',
      created_at: memberData.createdAt,
      user_metadata: {
        memberstack_id: memberData.id,
        plan_id: memberData.planConnections?.[0]?.planId
      }
    };
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: userData.email,
      user_metadata: userData.user_metadata,
      email_confirm: true
    });
    
    if (error) throw error;
    
    // Log sync event
    await logUserSync(data.user.id, 'created', null, userData);
    return data;
  };
  ```
- **Subscription Updates**: Sync plan and subscription changes:
  ```ts
  const syncSubscriptionChange = async (userId, subscriptionData) => {
    const updates = {
      subscription_status: subscriptionData.status,
      plan_id: subscriptionData.planId,
      updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: updates
    });
    
    if (error) throw error;
    
    // Update user_logs
    await logUserSync(userId, 'subscription_updated', null, updates);
    
    // Trigger PostHog event
    posthog.capture('subscription_changed', {
      user_id: userId,
      new_status: subscriptionData.status,
      plan_id: subscriptionData.planId
    });
  };
  ```

### Data Validation & Schema
- **User Data Schema**: Validate sync data with Zod schemas:
  ```ts
  const userSyncSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    subscription_status: z.enum(['active', 'inactive', 'cancelled', 'free']),
    plan_id: z.string().optional(),
    user_metadata: z.object({
      memberstack_id: z.string(),
      plan_id: z.string().optional(),
      subscription_status: z.string()
    })
  });
  
  const validateSyncData = (data) => {
    const result = userSyncSchema.safeParse(data);
    if (!result.success) {
      throw new Error(`Invalid sync data: ${result.error.message}`);
    }
    return result.data;
  };
  ```
- **Required Fields**: Ensure critical fields are present and valid
- **Data Sanitization**: Sanitize user input to prevent injection attacks

### Integration Points
- **Stripe Integration**: Sync subscription status from Stripe webhooks:
  ```ts
  const handleStripeSubscriptionUpdate = async (stripeEvent) => {
    const subscription = stripeEvent.data.object;
    const memberstackUserId = subscription.metadata.memberstack_user_id;
    
    if (memberstackUserId) {
      await syncSubscriptionChange(memberstackUserId, {
        status: subscription.status,
        planId: subscription.items.data[0].price.id
      });
    }
  };
  ```
- **Make.com Workflows**: Trigger automation workflows on sync events
- **PostHog Analytics**: Track sync events and user lifecycle metrics

### Performance Optimization
- **Batch Processing**: Process multiple sync operations in batches:
  ```ts
  const batchSyncUsers = async (users, batchSize = 10) => {
    const batches = [];
    for (let i = 0; i < users.length; i += batchSize) {
      batches.push(users.slice(i, i + batchSize));
    }
    
    for (const batch of batches) {
      await Promise.all(batch.map(user => syncUserData(user)));
      await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
    }
  };
  ```
- **Caching**: Cache frequently accessed user data with TTL
- **Async Processing**: Use background jobs for non-critical sync operations

### Monitoring & Analytics
- **Sync Metrics**: Track sync performance and success rates:
  ```ts
  const trackSyncMetrics = (operation, duration, success) => {
    posthog.capture('sync_operation', {
      operation_type: operation,
      duration_ms: duration,
      success: success,
      timestamp: Date.now()
    });
  };
  ```
- **PostHog Events**: Track key sync events:
  - `sync_completed` - Successful sync operation
  - `sync_failed` - Failed sync operation
  - `user_created` - New user synced from Memberstack
  - `subscription_changed` - Subscription status updated
  - `conflict_resolved` - Data conflict resolved
- **Error Monitoring**: Use Sentry for sync error tracking and alerting

## Validation

### CI/CD Enforcement
- **Sync Logic Testing**: CI/CD validates sync logic (`.github/workflows/sync.yml`):
  ```yaml
  - name: Test Memberstack Sync
    run: npm run test:sync
  - name: Validate RLS Policies
    run: npm run test:rls
  ```
- **Schema Validation**: Validate user schemas in pre-commit hooks
- **Integration Testing**: Test end-to-end sync workflows

### Testing Requirements
- **RLS Testing**: Verify Row-Level Security with Supatest (`backend/tests/rls.test.js`):
  ```ts
  test('RLS restricts user data access', async () => {
    const { data, error } = await supabase
      .from('user_logs')
      .select('*')
      .eq('user_id', 'other-user-id');
    
    expect(data).toHaveLength(0);
    expect(error).toBeNull();
  });
  ```
- **JWT Validation**: Test authentication middleware
- **Sync Logic**: Test conflict resolution and data merging
- **Error Handling**: Test retry logic and error scenarios

### Monitoring Validation
- **PostHog Dashboards**: Monitor sync metrics and user lifecycle events
- **Sentry Integration**: Track sync errors and performance issues
- **Sync Health**: Monitor sync success rates and response times

## File Structure
- **Services**: `backend/services/memberstack.js` - Core sync logic
- **Middleware**: `backend/middleware/auth.js` - JWT validation
- **Database**: `databases/user_logs`, `databases/audit_logs`
- **Frontend**: `frontend/src/utils/memberstack.ts`, `frontend/src/utils/memberstackAuth.ts`
- **Tests**: `backend/tests/rls.test.js`, `backend/tests/memberstack.test.js`
- **CI/CD**: `.github/workflows/sync.yml`

## References
- **PRD Sections**: 6.1 (Discovery Hook), 6.4-6.7 (Purchase Flow to Deliverable Generation), 8.2 (Frontend), 14 (Security Strategy)
- **Project Structure**: `backend/services/memberstack.js`, `databases/user_logs`, `databases/audit_logs`
- **Performance Targets**: <200ms sync response, <100ms error responses, 99.9% uptime
- **Security**: JWT validation, RLS enforcement, HMAC verification

## Version History
- **Version 2.0.0** - Comprehensive rewrite aligned with PRD sync requirements
- **Updated**: Current date, enhanced data integrity and security standards



