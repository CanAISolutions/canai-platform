---
description: 
globs: 
alwaysApply: true
---
# CanAI Make.com Automation Rules

## Purpose
Standardize automation workflows for reliability, security, and seamless integration across CanAI's 9-stage user journey with robust error handling and monitoring.

## Standards

### Naming Conventions
- **Descriptive Names**: Use clear, descriptive names for scenarios:
  - `add_project.json` - Project creation after payment
  - `add_client.json` - Client onboarding workflow
  - `admin_add_project.json` - Administrative project setup
  - `send_email.json` - Email notification workflows
  - `SAAP Update Project Blueprint.json` - Project status updates
- **File Organization**: Store scenarios in `backend/webhooks/make_scenarios/`
- **Handler Naming**: Use corresponding handlers (e.g., `add_project.js` for `add_project.json`)

### Trigger Configuration
- **Webhook Triggers**: Define triggers in `backend/webhooks/` with specific endpoints:
  - `log_interaction.js` - User interaction logging
  - `save_funnel.js` - Discovery funnel data processing
  - `generate_sparks.js` - Spark generation workflows
  - `log_payment.js` - Payment processing flows
  - `save_inputs.js` - Detailed input collection
  - `save_intent.js` - Intent mirror processing
  - `generate_pdf.js` - Deliverable PDF generation
  - `update_project.js` - Project status updates
  - `support_request.js` - Support queue management
- **Response Times**: Target <200ms response for all webhook triggers
- **Supabase Integration**: Trigger scenarios from table changes (e.g., `prompt_logs`, `payment_logs`)

### Retry Logic & Reliability
- **Retry Strategy**: Retry failed webhooks 3 times at 1-hour intervals
- **Exponential Backoff**: Use 2^i * 1000ms delay for immediate retries (API failures)
- **Dead-Letter Queue**: Route persistent failures to `backend/webhooks/dlq.js`:
  ```ts
  // Failed webhook handler
  if (retryCount >= 3) {
    await dlq.enqueue({
      webhook: webhookName,
      payload,
      error: lastError,
      originalTimestamp: Date.now()
    });
    posthog.capture('webhook_failed', { webhook: webhookName, retries: 3 });
  }
  ```
- **Failure Routing**: Log failures to `databases/error_logs` with `error_type: 'webhook_failure'`

### Idempotency & Data Integrity
- **Unique Identifiers**: Ensure idempotent operations with UUID v4 replay IDs
- **Idempotency Keys**: Include correlation IDs in all webhook payloads:
  ```json
  {
    "idempotency_key": "uuid-v4",
    "user_id": "uuid",
    "correlation_id": "uuid-v4",
    "timestamp": "ISO-8601",
    "payload": { ... }
  }
  ```
- **Duplicate Prevention**: Check for existing operations before processing
- **State Management**: Maintain consistent state across webhook retries

### Security & Authentication
- **Webhook Secrets**: Use webhook secrets for HMAC signature verification
- **HMAC Validation**: Verify signatures in all webhook handlers:
  ```ts
  const expectedSignature = crypto
    .createHmac('sha256', process.env.MAKE_WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  if (signature !== expectedSignature) {
    throw new Error('Invalid webhook signature');
  }
  ```
- **Scoped Tokens**: Use scoped API tokens with minimal required permissions
- **Supabase RLS**: Pass authorized user-scoped data respecting Row-Level Security

### Payload Validation
- **Schema Validation**: Validate all payloads against PRD schemas using Zod:
  ```ts
  const addProjectSchema = z.object({
    user_id: z.string().uuid(),
    product_type: z.enum(['business_builder', 'social_email', 'site_audit']),
    payment_id: z.string(),
    project_data: z.object({ ... })
  });
  
  const result = addProjectSchema.safeParse(webhookPayload);
  if (!result.success) {
    throw new Error('Invalid payload schema');
  }
  ```
- **Required Fields**: Ensure all critical fields are present and valid
- **Data Types**: Enforce correct data types and formats
- **Business Logic**: Validate business rules and constraints

### Monitoring & Logging
- **Automation Logs**: Log all events to `databases/automation_logs`:
  ```sql
  CREATE TABLE automation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    webhook_name TEXT NOT NULL,
    status TEXT CHECK (status IN ('triggered', 'success', 'failed', 'retrying')),
    payload JSONB,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```
- **PostHog Events**: Track automation metrics:
  - `automation_triggered` - Webhook initiated
  - `webhook_failed` - Webhook processing failed
  - `retry_attempted` - Retry operation started
  - `dlq_enqueued` - Message sent to dead-letter queue
  - `automation_recovered` - Failed automation recovered

### Error Handling & Recovery
- **Graceful Degradation**: Handle failures without breaking user experience
- **Error Classification**: Categorize errors (transient, permanent, configuration)
- **User Communication**: Provide meaningful error messages to users
- **Recovery Procedures**: Define clear recovery steps for common failure scenarios

### Webhook Batching & Performance
- **High-Volume Handling**: Batch high-volume interactions (e.g., `session_logs`)
- **Rate Limiting**: Respect Make.com rate limits and implement backoff
- **Payload Optimization**: Minimize payload size while maintaining data integrity
- **Async Processing**: Use asynchronous processing for non-critical operations

### Integration Requirements
- **Supabase Integration**: Seamless data flow between Make.com and Supabase
- **PostHog Analytics**: Track all automation events for monitoring
- **GPT-4o Workflows**: Integrate AI processing into automation flows
- **Hume AI Fallbacks**: Handle Hume AI circuit breaker scenarios
- **Stripe Integration**: Process payment-related automations securely

## Validation

### CI/CD Enforcement
- **Webhook Testing**: CI/CD tests webhook triggers and payloads (`.github/workflows/make.yml`)
- **Schema Validation**: Validate scenario schemas in pre-commit hooks
- **Integration Testing**: Test end-to-end workflow functionality

### Testing Requirements
- **Supatest Integration**: Verify idempotency and Dead-Letter Queue (`backend/tests/webhooks.test.js`)
- **Payload Testing**: Test all webhook payloads against schemas
- **Retry Testing**: Validate retry logic and failure recovery
- **Security Testing**: Test HMAC verification and authentication

### Monitoring Validation
- **PostHog Dashboards**: Monitor `automation_triggered`, `webhook_failed` events
- **Error Tracking**: Track webhook failures and recovery rates
- **Performance Metrics**: Monitor webhook response times and success rates

## File Structure
- **Scenarios**: `backend/webhooks/make_scenarios/` (JSON configurations)
- **Handlers**: `backend/webhooks/` (JavaScript webhook handlers)
- **Dead-Letter Queue**: `backend/webhooks/dlq.js`
- **Database**: `databases/automation_logs`, `databases/error_logs`
- **Tests**: `backend/tests/webhooks.test.js`
- **CI/CD**: `.github/workflows/make.yml`

## References
- **PRD Sections**: 6 (Functional Requirements), 8.5 (Integrations), 9 (Error Handling)
- **Project Structure**: `backend/webhooks/`, `databases/automation_logs`
- **Performance Targets**: <200ms webhook response, >85% retry success rate
- **Security**: HMAC verification, scoped tokens, RLS enforcement

## Version History
- **Version 2.0.0** - Comprehensive rewrite aligned with PRD automation requirements
- **Updated**: Current date, enhanced reliability and security standards



