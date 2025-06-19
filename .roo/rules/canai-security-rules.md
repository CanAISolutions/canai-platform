---
description: 
globs: 
alwaysApply: true
---
# CanAI Security Rules

## Purpose
Ensure robust security and GDPR/CCPA compliance for the CanAI Emotional Sovereignty Platform with comprehensive protection across authentication, encryption, data lifecycle, and regulatory compliance.

## Standards

### Authentication & Authorization
- **Memberstack Integration**:
  - Implement JWT validation in `backend/middleware/auth.js` for gated pages (`/inputs`, `/deliverables`)
  - Configure Memberstack client in `backend/services/memberstack.js`
  - JWT expiry: 1hr, validate on all protected API routes
  - Monitor unauthorized access attempts via Memberstack logs
- **API Route Protection**:
  - Protect all user-specific endpoints with Memberstack middleware
  - Implement authentication retry logic (3 attempts, exponential backoff 2^i * 1000ms)
  - Log authentication failures to `databases/error_logs` with `error_type: 'auth'`

### Row-Level Security (RLS)
- **Supabase RLS Policies** (`databases/migrations/`):
  - Apply `auth.uid() = user_id` to all user tables:
    ```sql
    CREATE POLICY session_logs_rls ON session_logs FOR ALL TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY initial_prompt_logs_rls ON initial_prompt_logs FOR ALL TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY spark_logs_rls ON spark_logs FOR ALL TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY payment_logs_rls ON payment_logs FOR ALL TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY prompt_logs_rls ON prompt_logs FOR ALL TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY comparisons_rls ON comparisons FOR ALL TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY feedback_logs_rls ON feedback_logs FOR ALL TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY error_logs_rls ON error_logs FOR ALL TO authenticated USING (auth.uid() = user_id);
    ```
- **RLS Validation**:
  - Test with Supatest (`backend/tests/rls.test.js`, id=`NFR2-tests`)
  - Verify unauthorized access restrictions across all tables
  - Validate RLS performance impact on queries

### Encryption & Data Protection
- **Supabase Vault** (`supabase/vault/config.yaml`):
  - Encrypt sensitive fields in `databases/` tables:
    - `comparisons.canai_output` and `comparisons.generic_output`
    - `payment_logs.stripe_session_id`
    - Any PII fields in user inputs
  - Configure vault encryption keys with rotation schedule
- **Transport Security**:
  - Enforce HTTPS via Render SSL for all endpoints
  - Implement HTTPS redirect in `backend/server.js`
  - Validate SSL certificates in CI/CD pipeline

### Content Security Policy (CSP)
- **CSP Headers** (`backend/server.js`):
  ```javascript
  app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' cdn.webflow.com; " +
      "style-src 'self' fonts.googleapis.com; " +
      "connect-src 'self' api.supabase.co api.stripe.com; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' fonts.gstatic.com;"
    );
    next();
  });
  ```
- **CSP Validation**:
  - Test CSP compliance in security scans
  - Monitor CSP violations via browser reporting
  - Update CSP for new third-party services

### Rate Limiting & DDoS Protection
- **Express Rate Limiting** (`backend/middleware/rateLimit.js`):
  ```javascript
  const rateLimit = require('express-rate-limit');
  
  const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      posthog.capture('rate_limit_exceeded', { 
        ip: req.ip, 
        endpoint: req.path 
      });
      res.status(429).json({ error: 'Rate limit exceeded' });
    }
  });
  ```
- **Endpoint-Specific Limits**:
  - Spark generation: 10 requests/min per user
  - Deliverable generation: 5 requests/min per user
  - Authentication attempts: 5 attempts/min per IP
- **Monitoring**: Track violations with PostHog and alert on suspicious patterns

### Input Sanitization & Validation
- **DOMPurify Sanitization** (`backend/middleware/validation.js`):
  ```javascript
  const DOMPurify = require('isomorphic-dompurify');
  const { z } = require('zod');
  
  const sanitizeInput = (input) => {
    if (typeof input === 'string') {
      return DOMPurify.sanitize(input);
    }
    return input;
  };
  
  const businessInputSchema = z.object({
    businessName: z.string().min(3).max(50),
    businessDescription: z.string().min(10).max(1000),
    primaryGoal: z.string().min(5).max(200)
  });
  ```
- **Validation Pipeline**:
  - Sanitize all user inputs before processing
  - Validate against Zod schemas before database insertion
  - Reject inputs containing potential XSS/injection patterns
  - Log validation failures for security monitoring

### GDPR/CCPA Compliance
- **Consent Management**:
  - Implement consent modal in `frontend/public/consent.html`
  - Log consent choices to `databases/session_logs`
  - Consent API: `/v1/consent` (`backend/routes/consent.js`)
  - Response time: <200ms for consent logging
- **Data Lifecycle Management**:
  - **Data Purge**: Automated 24-month purge via `databases/cron/purge.sql`
    ```sql
    DELETE FROM initial_prompt_logs WHERE created_at < NOW() - INTERVAL '24 months' 
    AND user_id NOT IN (SELECT user_id FROM session_logs WHERE created_at > NOW() - INTERVAL '24 months');
    ```
  - **Data Anonymization**: Monthly anonymization via `databases/cron/anonymize.sql`
    ```sql
    UPDATE feedback_logs SET user_id = NULL, 
    comment = REGEXP_REPLACE(comment, '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', '[email redacted]') 
    WHERE created_at < NOW() - INTERVAL '1 month';
    ```
  - **User Data Deletion**: `/v1/purge-data` API (`backend/routes/purge.js`) for user-requested deletion

### Secrets Management
- **Environment Variables**:
  - Store secrets in `.env` files (never commit to git)
  - Use Render environment variables for production
  - Rotate API keys every 90 days
  - Implement secret scanning in CI/CD
- **API Key Management**:
  - Separate keys for development/staging/production
  - Monitor API key usage and detect anomalies
  - Implement key rotation automation
  - Log key rotation events to audit trail

### Security Testing & Vulnerability Management
- **OWASP ZAP Scanning** (`.github/workflows/security.yml`):
  ```yaml
  - name: OWASP ZAP Baseline Scan
    uses: zaproxy/action-baseline@v0.7.0
    with:
      target: 'http://localhost:3000'
      rules_file_name: '.zap/rules.tsv'
      cmd_options: '-a'
  ```
- **Dependency Scanning**:
  - Run `npm audit` in CI/CD pipeline
  - Use Snyk or similar for vulnerability detection
  - Automated dependency updates with security patches
  - Monitor for zero-day vulnerabilities
- **Penetration Testing**:
  - Quarterly external penetration tests
  - Document findings in `docs/security-audit-log.md`
  - Implement remediation tracking

### Monitoring & Incident Response
- **Security Event Logging**:
  - Log to Supabase `databases/error_logs` with `error_type: 'security'`
  - PostHog security events:
    ```javascript
    posthog.capture('security_violation', { 
      type: 'unauthorized_access', 
      endpoint: req.path, 
      user_id: req.user?.id 
    });
    posthog.capture('audit_log_entry', { 
      action: 'data_access', 
      resource: 'user_data', 
      user_id: req.user?.id 
    });
    ```
- **Sentry Error Monitoring**:
  - Track security-related errors and exceptions
  - Alert on suspicious patterns or repeated failures
  - Integrate with incident response workflows
- **Audit Trail**:
  - Log all data access and modifications
  - Track user actions across the 9-stage journey
  - Maintain audit logs for compliance requirements

### API Security
- **Webhook Security**:
  - HMAC signature verification for Make.com webhooks (`backend/webhooks/`)
  - Validate webhook payloads against expected schemas
  - Implement replay attack protection
- **Stripe Integration Security**:
  - Use Stripe's webhook signature verification
  - Secure handling of payment data (never store card details)
  - Implement PCI DSS compliance measures
- **Third-Party API Security**:
  - Secure API key storage for GPT-4o and Hume AI
  - Implement circuit breakers for external service failures
  - Monitor API usage for anomalies

## Validation

### Testing Requirements
- **RLS Testing**: Supatest validation (`backend/tests/rls.test.js`)
- **Security Scanning**: OWASP ZAP and Semgrep in CI/CD
- **Authentication Testing**: Jest tests for auth flows
- **Input Validation Testing**: Test sanitization and validation logic
- **Compliance Testing**: Verify GDPR/CCPA data handling

### Acceptance Criteria
- AC-1: RLS restricts unauthorized access, validated by Supatest
- AC-2: HTTPS enforced for all endpoints, verified by OWASP ZAP
- AC-3: Consent modal displays for EU/US users, opt-in logged <200ms
- AC-4: No critical vulnerabilities in security scans
- AC-5: Rate limiting blocks >100 req/min per IP
- AC-6: All sensitive data encrypted at rest via Supabase vault
- AC-7: Authentication failures logged and monitored
- AC-8: Data purge/anonymization runs successfully on schedule

### Security Metrics
- Failed authentication attempts per hour
- Rate limiting violations per day
- Security scan results (critical/high/medium/low)
- Data breach incidents (target: 0)
- Compliance audit results
- API key rotation compliance

## Technical Implementation

### File Structure Targets
- `backend/middleware/auth.js` - Memberstack JWT validation
- `backend/middleware/rateLimit.js` - Express rate limiting
- `backend/middleware/validation.js` - Input sanitization with DOMPurify
- `backend/routes/consent.js` - GDPR/CCPA consent handling
- `backend/routes/purge.js` - User data deletion API
- `backend/services/memberstack.js` - Authentication service
- `backend/tests/rls.test.js` - RLS validation tests
- `backend/tests/security.test.js` - Security integration tests
- `databases/migrations/` - RLS policies and security schemas
- `databases/cron/purge.sql` - Automated data purge
- `databases/cron/anonymize.sql` - Data anonymization
- `supabase/vault/config.yaml` - Encryption configuration
- `.github/workflows/security.yml` - Security CI/CD pipeline

### Security Middleware Stack
- Authentication middleware for protected routes
- Rate limiting middleware for all endpoints
- Input validation and sanitization middleware
- CSP header middleware
- Security logging middleware

## References
- PRD Sections: 7.2 (Security), 7.3 (Data Lifecycle), 11.3 (Legal & Security Constraints), 14 (Security Strategy)
- Project Structure: `backend/middleware/`, `backend/services/`, `databases/migrations/`, `databases/cron/`
- Compliance: GDPR/CCPA data handling, consent management
- Testing: OWASP ZAP, Semgrep, Supatest, Jest security tests

---
**Updated**: June 18, 2025  
**Version**: 2.0.0  
**Scope**: Authentication, encryption, compliance, vulnerability management, incident response







