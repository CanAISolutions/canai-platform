---
description: 
globs: 
alwaysApply: true
---
# CanAI TaskMaster Rules

## Purpose
Standardize TaskMaster task definitions and dependency management for the **CanAI Emotional Sovereignty Platform**, ensuring alignment with the 9-stage user journey, backend APIs, deployment milestones, and project objectives. Enhance traceability, reliability, and Roo Code AI development experience through comprehensive task structures and clear dependency graphs.

## Standards

### Task Definition Structure
- **Unique ID Format**: `T{Section}.{Subsection}.{Task}-{descriptive-name}` (e.g., `T6.2.1-validate-input-api`)
- **Required Fields**: 
  - `id`: Unique identifier following the format above
  - `description`: Clear, concise work description with goal restatement
  - `inputs`: Specific file paths and dependencies
  - `outputs`: Expected deliverables and artifacts
  - `dependencies`: Referenced task IDs (no circular dependencies)
  - `roo-ai-instructions`: Detailed implementation guidance for Roo Code AI
- **Goal Restatement**: Every task must begin description with the goal
- **Output Validation**: Include bullet list of how outputs fulfill the stated goal

#### Example Task Structure:
```yaml
tasks:
  - id: T6.2.1-validate-input-api
    description: Implement POST /v1/validate-input API to validate 2-step discovery funnel inputs, compute trust scores, and enable emotional resonance tracking for the CanAI platform.
    inputs:
      - backend/routes/funnel.js
      - backend/middleware/validation.js
      - backend/services/gpt4o.js
      - backend/services/hume.js
      - databases/migrations/initial_prompt_logs.sql
      - .env (SUPABASE_URL, PROJECT_ID, OPENAI_API_KEY, HUME_API_KEY)
    outputs:
      - POST /v1/validate-input API endpoint with Joi validation
      - Trust score computation using GPT-4o integration
      - Emotional resonance validation via Hume AI
      - Supabase initial_prompt_logs table integration
      - PostHog event tracking for funnel_step completion
    dependencies:
      - T8.2.1-supabase-schema
      - T8.4.1-ai-integration
    roo-ai-instructions:
      - Create Express route handler in backend/routes/funnel.js
      - Implement Joi validation schemas for businessType, primaryChallenge, outcome, tone
      - Integrate GPT-4o service for trust score calculation (0-100 scale)
      - Add Hume AI circuit breaker with GPT-4o fallback (-0.2 TrustDelta penalty)
      - Store validated inputs in Supabase initial_prompt_logs with RLS policies
      - Log funnel_step event: posthog.capture('funnel_step', { stepName: 'discovery_funnel', completed: true })
      - Handle errors with <100ms response time using backend/middleware/error.js
      - Write Jest tests in backend/tests/funnel.test.js with >80% coverage
    goal_fulfillment:
      - ✓ Validates user inputs for 2-step discovery funnel
      - ✓ Computes trust scores to drive purchase intent
      - ✓ Enables emotional resonance tracking for platform optimization
      - ✓ Integrates with Supabase for data persistence
      - ✓ Provides analytics via PostHog for funnel optimization
```

### Dependency Management
- **Dependency Specification**: Use exact task IDs (e.g., `T8.2.1-supabase-schema`)
- **Circular Dependency Prevention**: Validate dependency graphs before execution
- **Prerequisite Validation**: Ensure all dependencies completed before task execution
- **Dependency Graph Mapping**: Maintain comprehensive dependency matrix for TaskMaster resolution

#### Dependency Graph Structure:
```yaml
dependency_graph:
  foundation_tasks:
    - T8.1.1-backend-setup          # Render backend configuration
    - T8.2.1-supabase-schema        # Database schema and RLS
    - T8.4.1-ai-integration         # GPT-4o and Hume AI setup
    - T8.5.1-monitoring-setup       # Sentry and PostHog configuration
  
  api_implementation_tasks:
    - T6.1.1-messages-api           # Discovery Hook API
    - T6.2.1-validate-input-api     # Discovery Funnel validation
    - T6.3.1-generate-sparks-api    # Spark Layer generation
    - T6.4.1-stripe-session-api     # Purchase Flow integration
    - T6.5.1-save-progress-api      # Detailed Input Collection
    - T6.6.1-intent-mirror-api      # Intent Mirror summary
    - T6.7.1-request-revision-api   # Deliverable Generation
    - T6.8.1-spark-split-api        # SparkSplit comparison
    - T6.9.1-feedback-api           # Feedback Capture
  
  integration_tasks:
    - T8.3.1-makecom-add-project    # Make.com project creation
    - T8.3.2-makecom-other-scenarios # Additional Make.com workflows
    - T8.6.1-output-quality-validation # Quality assurance
```

### Project Structure Alignment
Tasks must align with the established project structure:

#### Backend Structure Mapping:
```
backend/
├── api/src/                    # Core API logic (T8.1.1-backend-setup)
├── routes/                     # API endpoints (T6.x.x-*-api tasks)
├── middleware/                 # Express middleware (validation, auth, rate limiting)
├── services/                   # Business logic (GPT-4o, Hume AI, Stripe, PostHog)
├── prompts/                    # LLM prompt templates
├── webhooks/make_scenarios/    # Make.com integration (T8.3.x tasks)
├── tests/                      # Jest test files
└── supabase/                   # Supabase client configuration
```

#### Database Structure Mapping:
```
databases/
├── migrations/                 # Schema definitions (T8.2.1-supabase-schema)
├── cron/                      # Scheduled jobs (data lifecycle)
└── seed/                      # Initial data
```

### 9-Stage User Journey Task Mapping
Tasks must map to the PRD-defined 9-stage user journey:

| Stage | Component | Primary Tasks | API Endpoints |
|-------|-----------|---------------|---------------|
| F1 | Discovery Hook | T6.1.1-messages-api, T6.1.2-log-interaction | GET /v1/messages, POST /v1/log-interaction |
| F2 | 2-Step Discovery Funnel | T6.2.1-validate-input-api, T6.2.2-generate-tooltip | POST /v1/validate-input, POST /v1/generate-tooltip |
| F3 | Spark Layer | T6.3.1-generate-sparks-api, T6.3.2-regenerate-sparks-api | POST /v1/generate-sparks, POST /v1/regenerate-sparks |
| F4 | Purchase Flow | T6.4.1-stripe-session-api, T6.4.2-refund-api | POST /v1/stripe-session, POST /v1/refund |
| F5 | Detailed Input Collection | T6.5.1-save-progress-api, T6.5.2-generate-tooltip | POST /v1/save-progress, POST /v1/generate-tooltip |
| F6 | Intent Mirror | T6.6.1-intent-mirror-api | POST /v1/intent-mirror |
| F7 | Deliverable Generation | T6.7.1-request-revision-api | POST /v1/request-revision |
| F8 | SparkSplit | T6.8.1-spark-split-api | POST /v1/spark-split |
| F9 | Feedback Capture | T6.9.1-feedback-api | POST /v1/feedback |

### Performance and Quality Requirements
All tasks must meet PRD-defined performance targets:

- **API Response Times**: <200ms for standard APIs, <1.5s for Spark generation, <2s for Deliverable generation
- **Error Response Times**: <100ms for error handling
- **Test Coverage**: >80% Jest test coverage for all implemented functionality
- **Accessibility**: WCAG 2.2 AA compliance with ARIA labels and ≥48px tap targets
- **Security**: Supabase RLS policies, rate limiting (100 req/min/IP), input sanitization

### AI Integration Standards
Tasks involving AI services must include:

- **GPT-4o Integration**: Proper prompt engineering, token management, error handling
- **Hume AI Integration**: Emotional resonance validation (arousal >0.5, valence >0.6)
- **Circuit Breaker Pattern**: Hume AI fallback to GPT-4o after >900 req/day
- **Cost Controls**: Monthly budget monitoring (<$50 GPT-4o + $100 Hume AI)
- **Quality Validation**: TrustDelta ≥4.0/5.0, emotional resonance >0.7

### Documentation Requirements
- **Task Documentation**: Update `docs/taskmaster.md` for task definitions and dependencies
- **API Documentation**: Maintain `docs/api/endpoints.md` for implemented endpoints
- **Deployment Documentation**: Update `docs/deployment/guide.md` for deployment procedures
- **Architecture Documentation**: Update `docs/development/architecture.md` for system changes

### Validation and Testing
- **CI/CD Integration**: Validate tasks in `.github/workflows/taskmaster.yml`
- **Dependency Validation**: Use `task-master list` to verify task definitions
- **Test Requirements**: Jest tests in `backend/tests/` with naming pattern `{feature}.test.js`
- **Integration Testing**: Supatest for database operations, Supertest for API endpoints
- **Load Testing**: Locust tests for 10k user scalability validation

### Monitoring and Analytics
Tasks must include appropriate monitoring:

- **PostHog Events**: Track completion with `posthog.capture('task_completed', { task_id, duration_ms })`
- **Error Logging**: Log failures to Supabase `error_logs` and Sentry
- **Performance Metrics**: Track API latency, database query performance
- **Quality Metrics**: Monitor TrustDelta, emotional resonance, user satisfaction

### Roo Code AI Optimization
Tasks must include detailed Roo Code AI instructions:

- **File-Specific Guidance**: Reference exact file paths and expected modifications
- **Implementation Steps**: Step-by-step implementation instructions
- **Code Examples**: Provide code snippets and patterns
- **Testing Instructions**: Specify test requirements and validation steps
- **Integration Points**: Detail how components integrate with existing systems

### Error Handling and Resilience
All tasks must implement robust error handling:

- **Retry Logic**: Exponential backoff for external API calls (3 attempts, 2^i * 1000ms delay)
- **Circuit Breakers**: Implement for external service dependencies
- **Graceful Degradation**: Provide fallback mechanisms for service failures
- **Error Logging**: Comprehensive error tracking and alerting
- **Recovery Procedures**: Document recovery steps for common failure scenarios

### Security and Compliance
Security requirements for all tasks:

- **Authentication**: Memberstack JWT validation where required
- **Authorization**: Supabase RLS policies for data access
- **Input Validation**: Joi schemas and DOMPurify sanitization
- **Rate Limiting**: Express rate limiting middleware
- **Data Privacy**: GDPR/CCPA compliance with data purging and anonymization

## Task Categories

### Foundation Tasks (T8.x.x)
Core infrastructure and setup tasks that enable all other functionality.

### API Implementation Tasks (T6.x.x)
User journey stage-specific API endpoints and functionality.

### Integration Tasks (T8.3.x, T8.6.x)
Third-party service integrations and quality enhancements.

### Testing and Quality Tasks (T13.x.x)
Comprehensive testing strategy implementation.

### Security Tasks (T14.x.x)
Security measures and compliance implementation.

### Deployment Tasks (T15.x.x)
Deployment automation and operations.

## AI Usage Rules Implementation

### Task ID: T19.1.1-ai-usage-rules
**Description**: Implement comprehensive AI usage standards and review processes for the CanAI platform to ensure consistent, high-quality AI-generated content and code.

**Actions**:
- Update all rule files with AI development standards and best practices
- Create `canai-ai-usage-rules.md` in `temp-roo-rules/` directory
- Develop comprehensive AI Review Checklist for code and content validation
- Configure CI/CD pipelines to enforce AI usage rules and quality gates
- Establish AI model versioning and traceability systems
- Implement AI output validation and quality scoring mechanisms

**Validation Requirements**:
- CI/CD runs `task-master list` to verify task definitions and dependencies
- Jest tests ensure task alignment with Cortex milestones
- Manual reviews confirm documentation currency and alignment
- PostHog tracks AI usage events: `ai_task_created`, `ai_task_completed`, `ai_dependency_error`

## Cortex Integration

### Milestone Alignment
All TaskMaster tasks must align with Cortex milestones documented in `docs/cortex.md`:

- **Milestone Tracking**: Each completed task updates corresponding Cortex milestone
- **Progress Reporting**: Task completion triggers Cortex milestone progress updates
- **Dependency Mapping**: Cortex milestones map to TaskMaster dependency chains
- **Quality Gates**: Cortex milestones serve as quality checkpoints for task completion

### Cortex Update Requirements
- **Automatic Updates**: Task completion automatically updates Cortex milestones
- **Manual Verification**: Critical milestones require manual verification and sign-off
- **Progress Tracking**: Real-time progress tracking through PostHog analytics
- **Rollback Procedures**: Failed tasks trigger Cortex milestone rollback procedures

## Task Execution Workflow

### Pre-Execution Phase
1. **Dependency Validation**: Verify all prerequisite tasks are completed
2. **Environment Setup**: Confirm all required environment variables and configurations
3. **File Availability**: Validate all input files and dependencies exist
4. **Resource Allocation**: Ensure sufficient system resources for task execution
5. **Backup Creation**: Create rollback points for critical system components

### Execution Phase
1. **Task Initialization**: Log task start with PostHog and update Cortex milestone
2. **Progress Monitoring**: Track execution progress and performance metrics
3. **Quality Validation**: Continuous validation against quality standards
4. **Error Handling**: Implement robust error handling and recovery mechanisms
5. **Output Generation**: Produce all required outputs and artifacts

### Post-Execution Phase
1. **Output Verification**: Validate all expected outputs are produced correctly
2. **Quality Assessment**: Run comprehensive quality checks and tests
3. **Documentation Updates**: Update relevant documentation and API catalogs
4. **Milestone Updates**: Update Cortex milestones and dependency tracking
5. **Performance Analysis**: Analyze execution metrics and optimization opportunities

## Enhanced Roo Code AI Instructions

### Code Generation Standards
- **File-Specific Context**: Provide detailed context about file purpose and structure
- **Implementation Patterns**: Reference established patterns and conventions
- **Integration Points**: Detail how new code integrates with existing systems
- **Error Handling**: Specify error handling patterns and requirements
- **Testing Requirements**: Define comprehensive testing strategies and coverage targets

### Documentation Standards
- **Inline Documentation**: Require comprehensive JSDoc comments for all functions
- **API Documentation**: Maintain up-to-date API documentation with examples
- **Architecture Documentation**: Update system architecture documentation for changes
- **Deployment Documentation**: Keep deployment procedures current and accurate
- **Troubleshooting Guides**: Provide detailed troubleshooting and recovery procedures

### Quality Assurance
- **Code Review Requirements**: Specify code review criteria and processes
- **Testing Standards**: Define unit, integration, and end-to-end testing requirements
- **Performance Benchmarks**: Establish performance targets and monitoring requirements
- **Security Standards**: Implement comprehensive security validation and compliance checks
- **Accessibility Standards**: Ensure WCAG 2.2 AA compliance for all user-facing components

## Task Templates

### API Implementation Task Template
```yaml
- id: T{section}.{subsection}.{number}-{api-name}-api
  description: Implement {HTTP_METHOD} /v1/{endpoint} API to {primary_purpose} for the CanAI {stage_name} stage, enabling {business_value}.
  inputs:
    - backend/routes/{route_file}.js
    - backend/middleware/{middleware_files}.js
    - backend/services/{service_files}.js
    - databases/migrations/{table_name}.sql
    - .env ({required_env_vars})
  outputs:
    - {HTTP_METHOD} /v1/{endpoint} API endpoint with {validation_type} validation
    - {integration_type} integration with {external_services}
    - Supabase {table_name} table integration with RLS policies
    - PostHog event tracking for {tracked_events}
    - Jest tests with >80% coverage in backend/tests/{feature}.test.js
  dependencies:
    - {prerequisite_task_ids}
  roo-ai-instructions:
    - Create Express route handler in backend/routes/{route_file}.js
    - Implement {validation_library} validation schemas for {input_fields}
    - Integrate {ai_service} for {ai_functionality}
    - Add error handling with <{response_time}ms response time
    - Store data in Supabase {table_name} with RLS policies
    - Log {event_name} event with PostHog
    - Write comprehensive Jest tests with edge case coverage
  goal_fulfillment:
    - ✓ {specific_goal_1}
    - ✓ {specific_goal_2}
    - ✓ {specific_goal_3}
```

### Integration Task Template
```yaml
- id: T{section}.{subsection}.{number}-{integration-name}
  description: Integrate {service_name} with CanAI platform to {primary_purpose}, enabling {business_capability}.
  inputs:
    - backend/services/{service_name}.js
    - backend/webhooks/{webhook_files}.js
    - backend/middleware/{middleware_files}.js
    - .env ({required_credentials})
  outputs:
    - {service_name} client integration with authentication
    - Webhook handlers for {webhook_events}
    - Error handling and retry logic with circuit breaker pattern
    - Monitoring and alerting for integration health
  dependencies:
    - {prerequisite_task_ids}
  roo-ai-instructions:
    - Implement {service_name} client in backend/services/{service_name}.js
    - Create webhook handlers for {specific_webhooks}
    - Add authentication and security validation
    - Implement retry logic with exponential backoff
    - Add comprehensive error handling and logging
    - Write integration tests with mock services
  goal_fulfillment:
    - ✓ {integration_goal_1}
    - ✓ {integration_goal_2}
    - ✓ {integration_goal_3}
```

## Validation

### Pre-Execution Validation
- **Dependency Check**: Verify all dependencies are completed
- **File Availability**: Confirm all input files exist
- **Environment Validation**: Check required environment variables
- **Schema Validation**: Validate task structure against standards

### Post-Execution Validation
- **Output Verification**: Confirm all expected outputs are produced
- **Test Execution**: Run associated Jest tests with >80% coverage
- **Integration Testing**: Validate API endpoints and database operations
- **Performance Testing**: Verify response time requirements are met

### Continuous Validation
- **CI/CD Pipeline**: Automated validation in GitHub workflows
- **Monitoring**: Real-time validation of deployed functionality
- **Quality Gates**: Prevent deployment of non-compliant implementations
- **Rollback Procedures**: Automated rollback for failed validations

## References

### PRD Alignment
- **Section 5**: User Journey Overview (9-stage mapping)
- **Section 6**: Functional Requirements (API specifications)
- **Section 7**: Non-Functional Requirements (performance targets)
- **Section 8**: Architecture (technical implementation)
- **Sections 9-17**: Quality, testing, security, and deployment requirements

### Project Structure
- **Backend**: `backend/routes/*, backend/services/*, backend/middleware/*`
- **Database**: `databases/migrations/*, databases/cron/*`
- **Documentation**: `docs/taskmaster.md, docs/api/endpoints.md`
- **CI/CD**: `.github/workflows/taskmaster.yml`
- **Testing**: `backend/tests/*.test.js`

### External Dependencies
- **Supabase**: Database and authentication platform
- **Make.com**: Workflow automation and webhooks
- **GPT-4o**: AI content generation service
- **Hume AI**: Emotional resonance validation service
- **PostHog**: Analytics and event tracking
- **Stripe**: Payment processing integration
- **Memberstack**: User authentication and management

---

**Updated**: June 18, 2025  
**Version**: 2.0.0  



**Compatibility**: PRD v4.0, Project Structure v1.2