---
description: 
globs: 
alwaysApply: true
---
# CanAI Data Lifecycle Rules

## Role and Expertise
You are a data lifecycle expert for the **CanAI Emotional Sovereignty Platform**, ensuring comprehensive data management compliance across the 9-stage user journey (F1-F9). You manage the complete data lifecycle from collection through 24-month retention, anonymization, and secure purging while maintaining emotional sovereignty principles and regulatory compliance (GDPR/CCPA).

## Key Principles

### 1. Emotional Data Protection
- **Emotional Sovereignty**: Treat emotional data (`emotional_resonance`, `trust_delta`, `brand_voice`) as highly sensitive personal data requiring enhanced protection via Supabase Vault encryption.
- **Purpose Limitation**: Use collected emotional data exclusively for delivering emotionally resonant outputs; no secondary use without explicit consent.
- **Minimal Collection**: Collect only the 12-field inputs necessary for the 9-stage journey; avoid data overreach.
- **Quality Over Quantity**: Prioritize data utility for AI improvement while maintaining strict privacy controls.

### 2. Regulatory Compliance Framework
- **GDPR Compliance** (EU users): Full implementation of user rights (access, rectification, erasure, portability, restriction) via `/v1/data-access` and `/v1/purge-data`.
- **CCPA Compliance** (California users): Consumer rights including transparency, deletion, and non-discrimination via consent modal (`frontend/public/consent.html`).
- **Breach Notification**: 72-hour breach notification procedures logged to `databases/error_logs` and PostHog.
- **Cross-Border Transfers**: Handle international data with appropriate safeguards and consent mechanisms.

## Detailed Data Lifecycle Implementation

### Stage 1: Data Collection (F1-F5)
- **Input Validation**: Sanitize all inputs using DOMPurify in `backend/middleware/validation.js` before database insertion:
  ```typescript
  // backend/middleware/validation.js
  import DOMPurify from 'dompurify';
  import { z } from 'zod';
  
  const inputSchema = z.object({
    businessDescription: z.string().min(10).max(500),
    primaryGoal: z.string().min(5).max(200),
    brandVoice: z.enum(['warm', 'bold', 'optimistic', 'professional', 'playful', 'inspirational']),
    // ... other 12-field inputs
  });
  
  export const validateAndSanitizeInput = (req, res, next) => {
    const sanitized = Object.keys(req.body).reduce((acc, key) => {
      acc[key] = DOMPurify.sanitize(req.body[key]);
      return acc;
    }, {});
    
    const result = inputSchema.safeParse(sanitized);
    if (!result.success) {
      return res.status(400).json({ error: 'Invalid input', details: result.error });
    }
    
    req.body = result.data;
    next();
  };
  ```

- **Consent Tracking**: Log consent via `POST /v1/consent` in `backend/routes/consent.js` before any data collection:
  ```typescript
  // backend/routes/consent.js
  export const logConsent = async (req, res) => {
    const { consent_type, consent_given, purpose_description, data_categories } = req.body;
    
    const { data, error } = await supabase
      .from('consent_records')
      .insert({
        user_id: req.user?.id || null,
        consent_type,
        consent_given,
        purpose_description,
        data_categories,
        consent_date: new Date().toISOString()
      });
    
    if (error) {
      await logToErrorLogs('consent_logging_failed', error, req.user?.id);
      return res.status(500).json({ error: 'Failed to log consent' });
    }
    
    // Track consent event
    posthog.capture('consent_given', {
      user_id: req.user?.id,
      consent_type,
      consent_given,
      timestamp: new Date().toISOString()
    });
    
    res.json({ success: true, consent_id: data[0].id });
  };
  ```

- **Field-Level Security Classification**:
  ```typescript
  // backend/services/data-classification.js
  export const DATA_SENSITIVITY_LEVELS = {
    HIGH: ['businessDescription', 'primaryGoal', 'uniqueValue', 'brandVoice', 'emotional_resonance'],
    MEDIUM: ['businessType', 'location', 'targetAudience', 'revenue_model'],
    LOW: ['timestamp', 'device_type', 'session_id', 'page_views']
  } as const;
  
  export const encryptSensitiveFields = async (data, sensitivityLevel = 'HIGH') => {
    const fieldsToEncrypt = DATA_SENSITIVITY_LEVELS[sensitivityLevel];
    const encrypted = { ...data };
    
    for (const field of fieldsToEncrypt) {
      if (encrypted[field]) {
        encrypted[field] = await supabaseVault.encrypt(encrypted[field]);
      }
    }
    
    return encrypted;
  };
  ```

### Stage 2: Data Storage and Organization
- **Database Schema with Lifecycle Metadata**:
  ```sql
  -- databases/migrations/data_lifecycle_schema.sql
  
  -- Core data tables with lifecycle tracking
  CREATE TABLE prompt_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    initial_prompt_id UUID REFERENCES initial_prompt_logs(id) ON DELETE CASCADE,
    payload JSONB NOT NULL,
    sensitivity_level TEXT CHECK (sensitivity_level IN ('HIGH', 'MEDIUM', 'LOW')) DEFAULT 'HIGH',
    retention_period INTERVAL DEFAULT '24 months',
    scheduled_deletion_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 months',
    anonymization_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );
  
  -- Data retention metadata for lifecycle management
  CREATE TABLE data_retention_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    record_id UUID NOT NULL,
    data_type TEXT NOT NULL,
    retention_period INTERVAL NOT NULL DEFAULT '24 months',
    legal_basis TEXT CHECK (legal_basis IN ('consent', 'contract', 'legitimate_interest', 'legal_obligation')) DEFAULT 'consent',
    created_at TIMESTAMPTZ DEFAULT now(),
    scheduled_deletion_at TIMESTAMPTZ NOT NULL,
    deletion_executed_at TIMESTAMPTZ,
    anonymization_executed_at TIMESTAMPTZ
  );
  
  -- Consent tracking with granular permissions
  CREATE TABLE consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL CHECK (consent_type IN ('data_processing', 'marketing', 'analytics', 'ai_training', 'emotional_analysis')),
    consent_given BOOLEAN NOT NULL,
    consent_date TIMESTAMPTZ DEFAULT now(),
    withdrawal_date TIMESTAMPTZ,
    purpose_description TEXT NOT NULL,
    data_categories TEXT[] NOT NULL,
    ip_address INET,
    user_agent TEXT
  );
  
  -- Create indexes for performance
  CREATE INDEX idx_prompt_logs_scheduled_deletion ON prompt_logs(scheduled_deletion_at) WHERE scheduled_deletion_at IS NOT NULL;
  CREATE INDEX idx_data_retention_deletion_date ON data_retention_metadata(scheduled_deletion_at) WHERE deletion_executed_at IS NULL;
  CREATE INDEX idx_consent_records_user_type ON consent_records(user_id, consent_type);
  
  -- Apply RLS to all lifecycle tables
  ALTER TABLE prompt_logs ENABLE ROW LEVEL SECURITY;
  ALTER TABLE data_retention_metadata ENABLE ROW LEVEL SECURITY;
  ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
  
  -- RLS policies
  CREATE POLICY prompt_logs_rls ON prompt_logs 
    FOR ALL TO authenticated USING (auth.uid() = user_id);
  CREATE POLICY data_retention_rls ON data_retention_metadata 
    FOR ALL TO authenticated USING (auth.uid() = user_id);
  CREATE POLICY consent_records_rls ON consent_records 
    FOR ALL TO authenticated USING (auth.uid() = user_id);
  ```

### Stage 3: Automated Lifecycle Management
- **24-Month Data Purge via pg_cron**:
  ```sql
  -- databases/cron/purge.sql
  
  -- Purge inactive user data after 24 months
  DO $$
  DECLARE
    purge_count INTEGER;
  BEGIN
    -- Purge prompt_logs for inactive users
    DELETE FROM prompt_logs 
    WHERE created_at < NOW() - INTERVAL '24 months' 
    AND user_id NOT IN (
      SELECT DISTINCT user_id FROM session_logs 
      WHERE created_at > NOW() - INTERVAL '24 months'
      AND user_id IS NOT NULL
    );
    
    GET DIAGNOSTICS purge_count = ROW_COUNT;
    
    -- Log purge operation
    INSERT INTO error_logs (error_type, error_message, context, created_at)
    VALUES ('data_lifecycle', 'Automated purge completed', 
            jsonb_build_object('purged_records', purge_count, 'table', 'prompt_logs'), 
            NOW());
    
    -- Purge other tables
    DELETE FROM feedback_logs WHERE created_at < NOW() - INTERVAL '24 months';
    DELETE FROM session_logs WHERE created_at < NOW() - INTERVAL '24 months';
    DELETE FROM error_logs WHERE created_at < NOW() - INTERVAL '12 months'; -- Shorter retention for operational data
    DELETE FROM spark_cache WHERE expires_at < NOW(); -- Clean expired cache
    
    -- Update retention metadata
    UPDATE data_retention_metadata 
    SET deletion_executed_at = NOW() 
    WHERE scheduled_deletion_at <= NOW() 
    AND deletion_executed_at IS NULL;
    
  END $$;
  
  -- Schedule the job to run daily at 2 AM
  SELECT cron.schedule('data-purge-job', '0 2 * * *', $$
    DO $$
    DECLARE
      purge_count INTEGER;
    BEGIN
      DELETE FROM prompt_logs 
      WHERE created_at < NOW() - INTERVAL '24 months' 
      AND user_id NOT IN (
        SELECT DISTINCT user_id FROM session_logs 
        WHERE created_at > NOW() - INTERVAL '24 months'
        AND user_id IS NOT NULL
      );
      
      GET DIAGNOSTICS purge_count = ROW_COUNT;
      
      INSERT INTO error_logs (error_type, error_message, context, created_at)
      VALUES ('data_lifecycle', 'Automated purge completed', 
              jsonb_build_object('purged_records', purge_count), NOW());
    END $$;
  $$);
  ```

- **Monthly Anonymization via pg_cron**:
  ```sql
  -- databases/cron/anonymize.sql
  
  -- Progressive anonymization based on data age and sensitivity
  DO $$
  DECLARE
    anonymized_count INTEGER;
  BEGIN
    -- Stage 1: Anonymize feedback after 1 month (immediate PII removal)
    UPDATE feedback_logs 
    SET user_id = NULL,
        comment = REGEXP_REPLACE(comment, 
          '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', 
          '[email-redacted]', 'g'),
        comment = REGEXP_REPLACE(comment, 
          '\b\d{3}-\d{3}-\d{4}\b', 
          '[phone-redacted]', 'g'),
        anonymization_date = NOW()
    WHERE created_at < NOW() - INTERVAL '1 month' 
    AND user_id IS NOT NULL;
    
    GET DIAGNOSTICS anonymized_count = ROW_COUNT;
    
    -- Stage 2: Anonymize business details after 3 months (preserve analytics value)
    UPDATE prompt_logs
    SET payload = payload || jsonb_build_object(
      'business_name', 'ANONYMIZED_' || LEFT(MD5(payload->>'business_name'), 8),
      'location', CASE 
        WHEN payload->>'location' LIKE '%,%' 
        THEN SPLIT_PART(payload->>'location', ',', 2) -- Keep region, remove city
        ELSE 'ANONYMIZED_LOCATION'
      END,
      'contact_email', '[email-redacted]',
      'phone_number', '[phone-redacted]'
    ),
    anonymization_date = NOW()
    WHERE created_at < NOW() - INTERVAL '3 months'
    AND anonymization_date IS NULL;
    
    -- Stage 3: Anonymize session logs after 1 month
    UPDATE session_logs 
    SET user_id = NULL,
        interaction_details = interaction_details - 'user_email' - 'ip_address',
        anonymization_date = NOW()
    WHERE created_at < NOW() - INTERVAL '1 month' 
    AND user_id IS NOT NULL;
    
    -- Log anonymization operation
    INSERT INTO error_logs (error_type, error_message, context, created_at)
    VALUES ('data_lifecycle', 'Automated anonymization completed', 
            jsonb_build_object('anonymized_records', anonymized_count), NOW());
    
  END $$;
  
  -- Schedule monthly anonymization on the 1st at 3 AM
  SELECT cron.schedule('data-anonymization-job', '0 3 1 * *', $$
    DO $$
    DECLARE
      anonymized_count INTEGER;
    BEGIN
      UPDATE feedback_logs 
      SET user_id = NULL,
          comment = REGEXP_REPLACE(comment, 
            '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', 
            '[email-redacted]', 'g'),
          anonymization_date = NOW()
      WHERE created_at < NOW() - INTERVAL '1 month' 
      AND user_id IS NOT NULL;
      
      GET DIAGNOSTICS anonymized_count = ROW_COUNT;
      
      INSERT INTO error_logs (error_type, error_message, context, created_at)
      VALUES ('data_lifecycle', 'Automated anonymization completed', 
              jsonb_build_object('anonymized_records', anonymized_count), NOW());
    END $$;
  $$);
  ```

### Stage 4: User Rights Implementation
- **Data Access Requests (GDPR Article 15)**:
  ```typescript
  // backend/routes/data-access.js
  export const handleDataAccessRequest = async (req, res) => {
    try {
      const userId = req.user.id;
      const requestId = uuidv4();
      
      // Compile comprehensive user data
      const [personalData, interactionHistory, aiOutputs, processingLogs] = await Promise.all([
        getUserPersonalData(userId),
        getUserInteractions(userId),
        getUserOutputs(userId),
        getProcessingLogs(userId)
      ]);
      
      const userData = {
        request_id: requestId,
        user_id: userId,
        request_date: new Date().toISOString(),
        data_categories: {
          personal_data: personalData,
          interaction_history: interactionHistory,
          ai_outputs: aiOutputs,
          processing_logs: processingLogs,
          consent_records: await getConsentRecords(userId)
        },
        retention_information: await getRetentionInfo(userId),
        processing_purposes: [
          'Emotional AI content generation',
          'User experience personalization',
          'Platform improvement and analytics'
        ]
      };
      
      // Log the access request
      await logDataOperation('data_access_requested', {
        user_id: userId,
        request_id: requestId,
        data_categories: Object.keys(userData.data_categories)
      });
      
      // Track with PostHog (anonymized)
      posthog.capture('dsar_requested', {
        request_type: 'access',
        user_id: userId,
        timestamp: new Date().toISOString()
      });
      
      res.json({
        success: true,
        request_id: requestId,
        data: userData,
        download_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      });
      
    } catch (error) {
      await logToErrorLogs('data_access_failed', error, req.user?.id);
      res.status(500).json({ error: 'Failed to process data access request' });
    }
  };
  ```

- **Data Erasure Requests (GDPR Article 17)**:
  ```typescript
  // backend/routes/purge.js
  export const handleDataErasureRequest = async (req, res) => {
    try {
      const userId = req.user.id;
      const requestId = uuidv4();
      const { reason, confirmation } = req.body;
      
      if (!confirmation || confirmation !== 'DELETE_ALL_MY_DATA') {
        return res.status(400).json({ 
          error: 'Confirmation required',
          required_confirmation: 'DELETE_ALL_MY_DATA'
        });
      }
      
      // Begin transaction for complete data deletion
      const { data, error } = await supabase.rpc('complete_user_data_deletion', {
        target_user_id: userId,
        deletion_reason: reason || 'user_requested',
        request_id: requestId
      });
      
      if (error) {
        throw error;
      }
      
      // Log the erasure request
      await logDataOperation('data_erased', {
        user_id: userId,
        request_id: requestId,
        deletion_reason: reason,
        deleted_tables: data.deleted_tables,
        deleted_records_count: data.total_deleted
      });
      
      // Track with PostHog (final event for this user)
      posthog.capture('erasure_requested', {
        user_id: userId,
        deletion_reason: reason,
        timestamp: new Date().toISOString()
      });
      
      // Send confirmation email via Make.com
      await triggerMakeWebhook('purge_confirmation', {
        user_id: userId,
        request_id: requestId,
        deletion_summary: data
      });
      
      res.json({
        success: true,
        request_id: requestId,
        message: 'All user data has been permanently deleted',
        deleted_records: data.total_deleted,
        confirmation_email_sent: true
      });
      
    } catch (error) {
      await logToErrorLogs('data_erasure_failed', error, req.user?.id);
      res.status(500).json({ error: 'Failed to process data erasure request' });
    }
  };
  ```

### Stage 5: Compliance Monitoring and Reporting
- **Automated Compliance Monitoring**:
  ```typescript
  // backend/services/compliance-monitor.js
  export class ComplianceMonitor {
    static async runDailyComplianceCheck() {
      const checks = [
        this.checkRetentionCompliance(),
        this.checkAnonymizationCompliance(),
        this.checkConsentCompliance(),
        this.checkDataMinimizationCompliance()
      ];
      
      const results = await Promise.allSettled(checks);
      const violations = results
        .filter(result => result.status === 'fulfilled' && !result.value.compliant)
        .map(result => result.value);
      
      if (violations.length > 0) {
        await this.handleComplianceViolations(violations);
      }
      
      // Generate daily compliance report
      await this.generateComplianceReport(results);
    }
    
    static async checkRetentionCompliance() {
      const overdueRecords = await supabase
        .from('data_retention_metadata')
        .select('*')
        .lt('scheduled_deletion_at', new Date().toISOString())
        .is('deletion_executed_at', null);
      
      return {
        check_type: 'retention_compliance',
        compliant: overdueRecords.data?.length === 0,
        violations: overdueRecords.data || [],
        checked_at: new Date().toISOString()
      };
    }
    
    static async handleComplianceViolations(violations) {
      for (const violation of violations) {
        await logToErrorLogs('compliance_violation', violation, null);
        
        // Trigger immediate remediation
        switch (violation.check_type) {
          case 'retention_compliance':
            await this.executeEmergencyPurge(violation.violations);
            break;
          case 'anonymization_compliance':
            await this.executeEmergencyAnonymization(violation.violations);
            break;
        }
      }
      
      // Alert admin via Make.com
      await triggerMakeWebhook('compliance_alert', {
        violations,
        severity: 'high',
        timestamp: new Date().toISOString()
      });
    }
  }
  ```

## Performance and Analytics Integration

### PostHog Event Tracking for Data Lifecycle
```typescript
// backend/services/lifecycle-analytics.js
export const trackDataLifecycleEvent = (eventName: string, properties: any) => {
  // Sanitize properties to remove PII before tracking
  const sanitizedProps = {
    ...properties,
    user_id: properties.user_id ? hashUserId(properties.user_id) : null,
    timestamp: new Date().toISOString(),
    compliance_context: 'data_lifecycle'
  };
  
  // Remove any potential PII fields
  delete sanitizedProps.email;
  delete sanitizedProps.phone;
  delete sanitizedProps.business_name;
  
  posthog.capture(eventName, sanitizedProps);
};

// Key lifecycle events to track:
export const LIFECYCLE_EVENTS = {
  DATA_COLLECTED: 'data_collected',
  CONSENT_GIVEN: 'consent_given',
  CONSENT_WITHDRAWN: 'consent_withdrawn',
  DATA_ANONYMIZED: 'data_anonymized',
  DATA_PURGED: 'data_purged',
  DSAR_REQUESTED: 'dsar_requested',
  ERASURE_REQUESTED: 'erasure_requested',
  RETENTION_POLICY_APPLIED: 'retention_policy_applied',
  COMPLIANCE_VIOLATION: 'compliance_violation'
} as const;
```

### Error Handling for Data Lifecycle Operations
```typescript
// backend/middleware/lifecycle-error-handler.js
export const lifecycleErrorHandler = async (error: any, context: string, userId?: string) => {
  const errorContext = {
    error_type: 'data_lifecycle',
    context,
    error_message: error.message,
    stack_trace: error.stack,
    user_id: userId,
    timestamp: new Date().toISOString()
  };
  
  // Log to multiple systems for redundancy
  await Promise.allSettled([
    logToSupabase(errorContext),
    logToSentry(error, { context, userId }),
    trackDataLifecycleEvent('lifecycle_error', { context, error_type: error.name })
  ]);
  
  // Implement context-specific fallback strategies
  switch (context) {
    case 'data_purge':
      await scheduleManualReview('purge_failure', errorContext);
      break;
    case 'anonymization':
      await increaseRetentionMonitoring(errorContext);
      break;
    case 'consent_tracking':
      await defaultToRestrictiveConsent(errorContext);
      break;
    case 'user_rights':
      await escalateToDataProtectionOfficer(errorContext);
      break;
  }
};
```

## Integration with Make.com Workflows

### Automated Compliance Workflows
```json
// backend/webhooks/make_scenarios/data_lifecycle_automation.json
{
  "name": "CanAI Data Lifecycle Automation",
  "version": "2.0",
  "description": "Automated compliance workflows for data lifecycle management",
  "triggers": [
    {
      "type": "schedule",
      "name": "daily_lifecycle_maintenance",
      "schedule": "0 2 * * *",
      "action": "execute_lifecycle_tasks",
      "webhook_url": "https://canai-router.onrender.com/webhooks/lifecycle/daily"
    },
    {
      "type": "webhook",
      "name": "user_data_request",
      "event": "user_data_request",
      "action": "process_data_request",
      "webhook_url": "https://canai-router.onrender.com/webhooks/lifecycle/user-request"
    },
    {
      "type": "webhook",
      "name": "compliance_violation",
      "event": "compliance_violation",
      "action": "handle_violation",
      "webhook_url": "https://canai-router.onrender.com/webhooks/lifecycle/violation"
    }
  ],
  "flows": [
    {
      "name": "Daily Lifecycle Maintenance",
      "steps": [
        {
          "name": "check_retention_policies",
          "type": "http_request",
          "endpoint": "https://canai-router.onrender.com/v1/compliance/check-retention",
          "method": "POST"
        },
        {
          "name": "execute_scheduled_deletions",
          "type": "database_operation",
          "operation": "run_pg_cron_job",
          "job_name": "data-purge-job"
        },
        {
          "name": "run_anonymization_jobs",
          "type": "database_operation",
          "operation": "run_pg_cron_job",
          "job_name": "data-anonymization-job"
        },
        {
          "name": "generate_compliance_report",
          "type": "http_request",
          "endpoint": "https://canai-router.onrender.com/v1/compliance/generate-report",
          "method": "POST"
        }
      ]
    },
    {
      "name": "User Rights Request Processing",
      "steps": [
        {
          "name": "validate_request",
          "type": "validation",
          "schema": "user_rights_request_schema"
        },
        {
          "name": "process_request",
          "type": "conditional",
          "conditions": [
            {
              "if": "request_type == 'access'",
              "then": "execute_data_access"
            },
            {
              "if": "request_type == 'erasure'",
              "then": "execute_data_erasure"
            }
          ]
        },
        {
          "name": "send_confirmation",
          "type": "email",
          "template": "user_rights_confirmation"
        }
      ]
    }
  ]
}
```

## Testing and Validation Framework

### Comprehensive Test Coverage
```typescript
// backend/tests/data-lifecycle.test.js
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { supabase } from '../supabase/client.js';
import { DataLifecycleManager } from '../services/lifecycle-manager.js';
import { ComplianceMonitor } from '../services/compliance-monitor.js';
import { createTestUser, createTestData, cleanupTestData } from './test-helpers.js';

describe('Data Lifecycle Management', () => {
  let testUser;
  let testData;
  
  beforeEach(async () => {
    testUser = await createTestUser();
    testData = await createTestData(testUser.id);
  });
  
  afterEach(async () => {
    await cleanupTestData(testUser.id);
  });
  
  test('purges data after 24 months of inactivity', async () => {
    // Create test data older than 24 months
    const oldData = await createTestData(testUser.id, { 
      created_at: new Date(Date.now() - 25 * 30 * 24 * 60 * 60 * 1000) // 25 months ago
    });
    
    // Run purge job
    await DataLifecycleManager.executeScheduledDeletions();
    
    // Verify data is deleted
    const { data: remainingData } = await supabase
      .from('prompt_logs')
      .select('*')
      .eq('id', oldData.id);
      
    expect(remainingData).toHaveLength(0);
  });
  
  test('anonymizes PII after specified period', async () => {
    // Create test data with PII older than 1 month
    const dataWithPII = await supabase
      .from('feedback_logs')
      .insert({
        user_id: testUser.id,
        comment: 'Contact me at test@example.com or 555-123-4567',
        created_at: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000) // 32 days ago
      })
      .select()
      .single();
    
    // Run anonymization
    await DataLifecycleManager.executeAnonymization();
    
    // Verify PII is anonymized
    const { data: anonymizedData } = await supabase
      .from('feedback_logs')
      .select('*')
      .eq('id', dataWithPII.data.id)
      .single();
    
    expect(anonymizedData.data.user_id).toBeNull();
    expect(anonymizedData.data.comment).toContain('[email-redacted]');
    expect(anonymizedData.data.comment).toContain('[phone-redacted]');
    expect(anonymizedData.data.anonymization_date).toBeTruthy();
  });
  
  test('handles user data access requests correctly', async () => {
    const response = await request(app)
      .get('/v1/data-access')
      .set('Authorization', `Bearer ${testUser.token}`)
      .expect(200);
    
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('data_categories');
    expect(response.body.data.data_categories).toHaveProperty('personal_data');
    expect(response.body.data.data_categories).toHaveProperty('consent_records');
  });
  
  test('handles user data erasure requests correctly', async () => {
    const response = await request(app)
      .delete('/v1/purge-data')
      .set('Authorization', `Bearer ${testUser.token}`)
      .send({ 
        reason: 'user_requested',
        confirmation: 'DELETE_ALL_MY_DATA'
      })
      .expect(200);
    
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('deleted_records');
    expect(response.body.deleted_records).toBeGreaterThan(0);
    
    // Verify all user data is deleted
    const { data: remainingData } = await supabase
      .from('prompt_logs')
      .select('*')
      .eq('user_id', testUser.id);
      
    expect(remainingData).toHaveLength(0);
  });
  
  test('compliance monitoring detects violations', async () => {
    // Create overdue data that should have been deleted
    await supabase
      .from('data_retention_metadata')
      .insert({
        table_name: 'prompt_logs',
        user_id: testUser.id,
        record_id: testData.id,
        data_type: 'user_input',
        retention_period: '1 month',
        scheduled_deletion_at: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day overdue
      });
    
    const complianceCheck = await ComplianceMonitor.checkRetentionCompliance();
    
    expect(complianceCheck.compliant).toBe(false);
    expect(complianceCheck.violations).toHaveLength(1);
  });
  
  test('consent tracking works correctly', async () => {
    const consentData = {
      consent_type: 'data_processing',
      consent_given: true,
      purpose_description: 'AI content generation',
      data_categories: ['business_description', 'goals']
    };
    
    const response = await request(app)
      .post('/v1/consent')
      .set('Authorization', `Bearer ${testUser.token}`)
      .send(consentData)
      .expect(200);
    
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('consent_id');
    
    // Verify consent is stored
    const { data: consentRecord } = await supabase
      .from('consent_records')
      .select('*')
      .eq('id', response.body.consent_id)
      .single();
    
    expect(consentRecord.data.consent_given).toBe(true);
    expect(consentRecord.data.consent_type).toBe('data_processing');
  });
});
```

## Integration with CanAI Stack

### Supabase Integration
- **RLS Enforcement**: All lifecycle tables use RLS with `auth.uid() = user_id` policies
- **Vault Encryption**: Sensitive fields encrypted using `supabase/vault` for HIGH sensitivity data
- **pg_cron Jobs**: Automated purge and anonymization via scheduled database functions
- **Real-time Subscriptions**: Monitor compliance violations in real-time

### Webflow Integration
- **Consent Modal**: `frontend/public/consent.html` displays GDPR/CCPA consent with granular options
- **Privacy Policy**: Dynamic privacy policy page with data lifecycle information
- **User Dashboard**: Data access and deletion request forms integrated into user account pages

### Make.com Integration
- **Workflow Automation**: Automated compliance workflows via `backend/webhooks/make_scenarios/`
- **Email Notifications**: Confirmation emails for data access/erasure requests
- **Compliance Reporting**: Automated generation and distribution of compliance reports

### PostHog Integration
- **Privacy-Compliant Analytics**: All lifecycle events tracked with PII sanitization
- **Compliance Dashboards**: Real-time monitoring of data lifecycle metrics
- **Anomaly Detection**: Automated alerts for unusual data patterns or compliance violations

### Stripe Integration
- **Payment Data Retention**: Separate retention policies for financial records (7 years for tax compliance)
- **PCI Compliance**: Enhanced security for payment-related data lifecycle management

## Technical Implementation Guidelines

### File Structure and Organization
```
backend/
├── routes/
│   ├── consent.js              # Consent management endpoints
│   ├── data-access.js          # GDPR data access requests
│   ├── purge.js               # Data erasure endpoints
│   └── compliance.js          # Compliance monitoring endpoints
├── services/
│   ├── lifecycle-manager.js    # Core lifecycle management
│   ├── compliance-monitor.js   # Automated compliance checking
│   ├── data-classification.js  # Data sensitivity classification
│   └── lifecycle-analytics.js  # Analytics for lifecycle events
├── middleware/
│   ├── validation.js          # Input sanitization and validation
│   └── lifecycle-error-handler.js # Specialized error handling
├── webhooks/
│   └── make_scenarios/
│       └── data_lifecycle_automation.json # Make.com workflows
└── tests/
    ├── data-lifecycle.test.js  # Comprehensive lifecycle tests
    ├── compliance.test.js      # Compliance monitoring tests
    └── user-rights.test.js     # User rights implementation tests

databases/
├── migrations/
│   ├── data_lifecycle_schema.sql    # Core lifecycle tables
│   ├── consent_management.sql       # Consent tracking tables
│   └── compliance_monitoring.sql    # Compliance metadata tables
└── cron/
    ├── purge.sql               # Automated data purge jobs
    ├── anonymize.sql           # Automated anonymization jobs
    └── compliance_check.sql    # Daily compliance monitoring
```

## Performance Targets and Acceptance Criteria

### Performance Requirements
- **Data Access Requests**: <1s response time for user data compilation
- **Data Erasure Requests**: <5s for complete user data deletion
- **Consent Logging**: <100ms for consent record creation
- **Automated Purge**: Complete daily purge operations in <30 minutes
- **Anonymization**: Complete monthly anonymization in <1 hour
- **Compliance Monitoring**: Daily compliance checks complete in <10 minutes

### Acceptance Criteria
- **AC-1**: Data purged after 24 months, validated by Supatest (`backend/tests/purge.test.js`, id=`NFR3-tests`)
- **AC-2**: Feedback anonymized monthly, no PII retained after specified periods, verified by automated query
- **AC-3**: `/v1/data-access` compiles user data in <1s, includes all required categories
- **AC-4**: `/v1/purge-data` deletes user data in <5s, sends confirmation email
- **AC-5**: GDPR/CCPA consent logged in <100ms via `/v1/consent`
- **AC-6**: Zero compliance violations in quarterly audits
- **AC-7**: 100% test coverage for data lifecycle operations
- **AC-8**: All lifecycle events tracked in PostHog with PII sanitization
- **AC-9**: Automated compliance monitoring runs daily without manual intervention
- **AC-10**: User rights requests (access/erasure) processed within legal timeframes (30 days GDPR, 45 days CCPA)

## Validation and Monitoring

### CI/CD Integration
- **Pre-commit Hooks**: Validate data classification and retention policies
- **Automated Testing**: Comprehensive test suite runs on every deployment
- **Compliance Validation**: Automated checks ensure all lifecycle requirements are met
- **Schema Validation**: Database migrations validated for compliance requirements

### Monitoring and Alerting
- **PostHog Dashboards**: Real-time monitoring of lifecycle events and compliance metrics
- **Sentry Alerts**: Immediate notification of lifecycle operation failures
- **Supabase Monitoring**: Database performance and job execution monitoring
- **Make.com Workflows**: Automated escalation for compliance violations

### Audit Trail
- **Complete Logging**: All lifecycle operations logged with full context
- **Immutable Records**: Audit logs protected from modification
- **Regular Audits**: Quarterly compliance audits with external validation
- **Documentation**: Comprehensive documentation of all lifecycle processes

## Version History and Updates

- **Version 2.0.0** - Comprehensive rewrite aligned with current PRD and project structure
- **Updated**: Current date
- **Compliance**: Full GDPR/CCPA compliance with 72-hour breach notification
- **Performance**: <1s data access, <5s erasure, <100ms consent logging
- **Testing**: 100% test coverage for lifecycle operations
- **Monitoring**: Enhanced PostHog tracking and Sentry error handling
- **Integration**: Full Make.com workflow automation and Supabase pg_cron implementation

## Cortex Integration and Documentation

### Milestone Tracking
Update `docs/cortex.md` when implementing data lifecycle changes:

```markdown
## Data Lifecycle Milestones

### [Current Date] - Enhanced Lifecycle Rules Implementation
- **Change**: Implemented comprehensive data lifecycle management system
- **Components**: Advanced anonymization, automated compliance monitoring, user rights handling
- **Files Modified**: 
  - `backend/routes/consent.js` - Consent management endpoints
  - `backend/routes/data-access.js` - GDPR data access requests  
  - `backend/routes/purge.js` - Data erasure endpoints
  - `databases/cron/purge.sql` - Automated purge jobs
  - `databases/cron/anonymize.sql` - Automated anonymization jobs
  - `databases/migrations/data_lifecycle_schema.sql` - Core lifecycle tables
- **Compliance**: Full GDPR/CCPA compliance with 72-hour breach notification
- **Performance**: <1s data access, <5s erasure, <100ms consent logging
- **Testing**: Comprehensive test suite in `backend/tests/data-lifecycle.test.js`
- **Monitoring**: Enhanced PostHog tracking and Sentry error handling
- **Integration**: Full Make.com workflow automation via `backend/webhooks/make_scenarios/data_lifecycle_automation.json`
```

## Integration with Make.com Workflows

### Automated Compliance Workflows
```json
// backend/webhooks/make_scenarios/data_lifecycle_automation.json
{
  "name": "CanAI Data Lifecycle Automation",
  "version": "2.0",
  "description": "Automated compliance workflows for data lifecycle management",
  "triggers": [
    {
      "type": "schedule",
      "name": "daily_lifecycle_maintenance",
      "schedule": "0 2 * * *",
      "action": "execute_lifecycle_tasks",
      "webhook_url": "https://canai-router.onrender.com/webhooks/lifecycle/daily"
    },
    {
      "type": "webhook",
      "name": "user_data_request",
      "event": "user_data_request", 
      "action": "process_data_request",
      "webhook_url": "https://canai-router.onrender.com/webhooks/lifecycle/user-request"
    },
    {
      "type": "webhook",
      "name": "compliance_violation",
      "event": "compliance_violation",
      "action": "handle_violation",
      "webhook_url": "https://canai-router.onrender.com/webhooks/lifecycle/violation"
    }
  ],
  "flows": [
    {
      "name": "Daily Lifecycle Maintenance",
      "steps": [
        {
          "name": "check_retention_policies",
          "type": "http_request",
          "endpoint": "https://canai-router.onrender.com/v1/compliance/check-retention",
          "method": "POST"
        },
        {
          "name": "execute_scheduled_deletions",
          "type": "database_operation",
          "operation": "run_pg_cron_job",
          "job_name": "data-purge-job"
        },
        {
          "name": "run_anonymization_jobs",
          "type": "database_operation", 
          "operation": "run_pg_cron_job",
          "job_name": "data-anonymization-job"
        },
        {
          "name": "generate_compliance_report",
          "type": "http_request",
          "endpoint": "https://canai-router.onrender.com/v1/compliance/generate-report",
          "method": "POST"
        }
      ]
    },
    {
      "name": "User Rights Request Processing",
      "steps": [
        {
          "name": "validate_request",
          "type": "validation",
          "schema": "user_rights_request_schema"
        },
        {
          "name": "process_request",
          "type": "conditional",
          "conditions": [
            {
              "if": "request_type == 'access'",
              "then": "execute_data_access"
            },
            {
              "if": "request_type == 'erasure'",
              "then": "execute_data_erasure"
            }
          ]
        },
        {
          "name": "send_confirmation",
          "type": "email",
          "template": "user_rights_confirmation"
        }
      ]
    }
  ]
}
```

## Testing and Validation Framework

### Comprehensive Test Coverage
```typescript
// backend/tests/data-lifecycle.test.js
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { supabase } from '../supabase/client.js';
import { DataLifecycleManager } from '../services/lifecycle-manager.js';
import { ComplianceMonitor } from '../services/compliance-monitor.js';
import { createTestUser, createTestData, cleanupTestData } from './test-helpers.js';

describe('Data Lifecycle Management', () => {
  let testUser;
  let testData;
  
  beforeEach(async () => {
    testUser = await createTestUser();
    testData = await createTestData(testUser.id);
  });
  
  afterEach(async () => {
    await cleanupTestData(testUser.id);
  });
  
  test('purges data after 24 months of inactivity', async () => {
    // Create test data older than 24 months
    const oldData = await createTestData(testUser.id, { 
      created_at: new Date(Date.now() - 25 * 30 * 24 * 60 * 60 * 1000) // 25 months ago
    });
    
    // Run purge job
    await DataLifecycleManager.executeScheduledDeletions();
    
    // Verify data is deleted
    const { data: remainingData } = await supabase
      .from('prompt_logs')
      .select('*')
      .eq('id', oldData.id);
      
    expect(remainingData).toHaveLength(0);
  });
  
  test('anonymizes PII after specified period', async () => {
    // Create test data with PII older than 1 month
    const dataWithPII = await supabase
      .from('feedback_logs')
      .insert({
        user_id: testUser.id,
        comment: 'Contact me at test@example.com or 555-123-4567',
        created_at: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000) // 32 days ago
      })
      .select()
      .single();
    
    // Run anonymization
    await DataLifecycleManager.executeAnonymization();
    
    // Verify PII is anonymized
    const { data: anonymizedData } = await supabase
      .from('feedback_logs')
      .select('*')
      .eq('id', dataWithPII.data.id)
      .single();
    
    expect(anonymizedData.data.user_id).toBeNull();
    expect(anonymizedData.data.comment).toContain('[email-redacted]');
    expect(anonymizedData.data.comment).toContain('[phone-redacted]');
    expect(anonymizedData.data.anonymization_date).toBeTruthy();
  });
  
  test('handles user data access requests correctly', async () => {
    const response = await request(app)
      .get('/v1/data-access')
      .set('Authorization', `Bearer ${testUser.token}`)
      .expect(200);
    
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('data_categories');
    expect(response.body.data.data_categories).toHaveProperty('personal_data');
    expect(response.body.data.data_categories).toHaveProperty('consent_records');
  });
  
  test('handles user data erasure requests correctly', async () => {
    const response = await request(app)
      .delete('/v1/purge-data')
      .set('Authorization', `Bearer ${testUser.token}`)
      .send({ 
        reason: 'user_requested',
        confirmation: 'DELETE_ALL_MY_DATA'
      })
      .expect(200);
    
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('deleted_records');
    expect(response.body.deleted_records).toBeGreaterThan(0);
    
    // Verify all user data is deleted
    const { data: remainingData } = await supabase
      .from('prompt_logs')
      .select('*')
      .eq('user_id', testUser.id);
      
    expect(remainingData).toHaveLength(0);
  });
  
  test('compliance monitoring detects violations', async () => {
    // Create overdue data that should have been deleted
    await supabase
      .from('data_retention_metadata')
      .insert({
        table_name: 'prompt_logs',
        user_id: testUser.id,
        record_id: testData.id,
        data_type: 'user_input',
        retention_period: '1 month',
        scheduled_deletion_at: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day overdue
      });
    
    const complianceCheck = await ComplianceMonitor.checkRetentionCompliance();
    
    expect(complianceCheck.compliant).toBe(false);
    expect(complianceCheck.violations).toHaveLength(1);
  });
  
  test('consent tracking works correctly', async () => {
    const consentData = {
      consent_type: 'data_processing',
      consent_given: true,
      purpose_description: 'AI content generation',
      data_categories: ['business_description', 'goals']
    };
    
    const response = await request(app)
      .post('/v1/consent')
      .set('Authorization', `Bearer ${testUser.token}`)
      .send(consentData)
      .expect(200);
    
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('consent_id');
    
    // Verify consent is stored
    const { data: consentRecord } = await supabase
      .from('consent_records')
      .select('*')
      .eq('id', response.body.consent_id)
      .single();
    
    expect(consentRecord.data.consent_given).toBe(true);
    expect(consentRecord.data.consent_type).toBe('data_processing');
  });
});
```

## Integration with CanAI Stack

### Supabase Integration
- **RLS Enforcement**: All lifecycle tables use RLS with `auth.uid() = user_id` policies
- **Vault Encryption**: Sensitive fields encrypted using `supabase/vault` for HIGH sensitivity data
- **pg_cron Jobs**: Automated purge and anonymization via scheduled database functions
- **Real-time Subscriptions**: Monitor compliance violations in real-time

### Webflow Integration
- **Consent Modal**: `frontend/public/consent.html` displays GDPR/CCPA consent with granular options
- **Privacy Policy**: Dynamic privacy policy page with data lifecycle information
- **User Dashboard**: Data access and deletion request forms integrated into user account pages

### Make.com Integration
- **Workflow Automation**: Automated compliance workflows via `backend/webhooks/make_scenarios/data_lifecycle_automation.json`
- **Email Notifications**: Confirmation emails for data access/erasure requests
- **Compliance Reporting**: Automated generation and distribution of compliance reports

### PostHog Integration
- **Privacy-Compliant Analytics**: All lifecycle events tracked with PII sanitization
- **Compliance Dashboards**: Real-time monitoring of data lifecycle metrics
- **Anomaly Detection**: Automated alerts for unusual data patterns or compliance violations

### Stripe Integration
- **Payment Data Retention**: Separate retention policies for financial records (7 years for tax compliance)
- **PCI Compliance**: Enhanced security for payment-related data lifecycle management

## Technical Implementation Guidelines

### File Structure and Organization
```
backend/
├── routes/
│   ├── consent.js              # Consent management endpoints
│   ├── data-access.js          # GDPR data access requests
│   ├── purge.js               # Data erasure endpoints
│   └── compliance.js          # Compliance monitoring endpoints
├── services/
│   ├── lifecycle-manager.js    # Core lifecycle management
│   ├── compliance-monitor.js   # Automated compliance checking
│   ├── data-classification.js  # Data sensitivity classification
│   └── lifecycle-analytics.js  # Analytics for lifecycle events
├── middleware/
│   ├── validation.js          # Input sanitization and validation
│   └── lifecycle-error-handler.js # Specialized error handling
├── webhooks/
│   └── make_scenarios/
│       └── data_lifecycle_automation.json # Make.com workflows
└── tests/
    ├── data-lifecycle.test.js  # Comprehensive lifecycle tests
    ├── compliance.test.js      # Compliance monitoring tests
    └── user-rights.test.js     # User rights implementation tests

databases/
├── migrations/
│   ├── data_lifecycle_schema.sql    # Core lifecycle tables
│   ├── consent_management.sql       # Consent tracking tables
│   └── compliance_monitoring.sql    # Compliance metadata tables
└── cron/
    ├── purge.sql               # Automated data purge jobs
    ├── anonymize.sql           # Automated anonymization jobs
    └── compliance_check.sql    # Daily compliance monitoring
```

## Performance Targets and Acceptance Criteria

### Performance Requirements
- **Data Access Requests**: <1s response time for user data compilation
- **Data Erasure Requests**: <5s for complete user data deletion
- **Consent Logging**: <100ms for consent record creation
- **Automated Purge**: Complete daily purge operations in <30 minutes
- **Anonymization**: Complete monthly anonymization in <1 hour
- **Compliance Monitoring**: Daily compliance checks complete in <10 minutes

### Acceptance Criteria
- **AC-1**: Data purged after 24 months, validated by Supatest (`backend/tests/data-lifecycle.test.js`, id=`NFR3-tests`)
- **AC-2**: Feedback anonymized monthly, no PII retained after specified periods, verified by automated query
- **AC-3**: `/v1/data-access` compiles user data in <1s, includes all required categories
- **AC-4**: `/v1/purge-data` deletes user data in <5s, sends confirmation email
- **AC-5**: GDPR/CCPA consent logged in <100ms via `/v1/consent`
- **AC-6**: Zero compliance violations in quarterly audits
- **AC-7**: 100% test coverage for data lifecycle operations
- **AC-8**: All lifecycle events tracked in PostHog with PII sanitization
- **AC-9**: Automated compliance monitoring runs daily without manual intervention
- **AC-10**: User rights requests (access/erasure) processed within legal timeframes (30 days GDPR, 45 days CCPA)

## Validation and Monitoring

### CI/CD Integration
- **Pre-commit Hooks**: Validate data classification and retention policies
- **Automated Testing**: Comprehensive test suite runs on every deployment
- **Compliance Validation**: Automated checks ensure all lifecycle requirements are met
- **Schema Validation**: Database migrations validated for compliance requirements

### Monitoring and Alerting
- **PostHog Dashboards**: Real-time monitoring of lifecycle events and compliance metrics
- **Sentry Alerts**: Immediate notification of lifecycle operation failures
- **Supabase Monitoring**: Database performance and job execution monitoring
- **Make.com Workflows**: Automated escalation for compliance violations

### Audit Trail
- **Complete Logging**: All lifecycle operations logged with full context
- **Immutable Records**: Audit logs protected from modification
- **Regular Audits**: Quarterly compliance audits with external validation
- **Documentation**: Comprehensive documentation of all lifecycle processes

## Technical Notes
- **Primary Targets**: `backend/routes/`, `backend/services/`, `databases/migrations/`, `databases/cron/`
- **Supporting Files**: `backend/middleware/`, `backend/webhooks/make_scenarios/`, `frontend/public/`
- **Database Focus**: All Supabase schemas with special attention to `prompt_logs`, `session_logs`, `feedback_logs`, `error_logs`
- **Compliance Tools**: Supabase RLS, Vault encryption, PostHog analytics, Make.com automation
- **Performance Targets**: <1s data access, <5s erasure, <100ms consent logging, 24-month retention
- **Monitoring**: PostHog for lifecycle events, Sentry for errors, Supabase for audit trails

## Supporting PRD Stack Integration
- **Webflow**: Consent modal implementation and privacy policy display
- **Memberstack**: User authentication for data access and erasure requests
- **Supabase**: Primary data storage with RLS and encryption via Vault
- **Make.com**: Automated compliance workflows and lifecycle task execution
- **Stripe**: Payment data retention and compliance for financial records
- **GPT-4o**: AI processing audit trails and consent for training data use
- **Hume AI**: Emotional data processing compliance and circuit breaker implementation
- **PostHog**: Privacy-compliant analytics and lifecycle event tracking

## Version History and Updates

- **Version 2.0.0** - Comprehensive rewrite aligned with current PRD and project structure
- **Updated**: Current date
- **Compliance**: Full GDPR/CCPA compliance with 72-hour breach notification
- **Performance**: <1s data access, <5s erasure, <100ms consent logging
- **Testing**: 100% test coverage for data lifecycle operations
- **Monitoring**: Enhanced PostHog tracking and Sentry error handling
- **Integration**: Full Make.com workflow automation and Supabase pg_cron implementation





