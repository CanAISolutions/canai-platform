---
description: 
globs: 
alwaysApply: true
---
# CanAI Testing Rules

## Purpose

Ensure high-quality, reliable, and emotionally resonant AI outputs through comprehensive testing aligned with the CanAI Emotional Sovereignty Platform's 9-stage user journey, achieving >80% test coverage, 99.9% uptime, and TrustDelta ≥4.2.

## Standards

### Testing Pyramid
- **70% Unit Tests**: Focus on backend business logic (`backend/tests/*.test.js`), AI service validation (`backend/services/`), and frontend component behavior (`frontend/src/tests/`)
- **20% Integration Tests**: API endpoint validation (`backend/tests/api.test.js`), Make.com webhook flows (`backend/webhooks/make_scenarios/`), and Supabase interactions
- **10% End-to-End Tests**: Complete user journey validation (F1-F9), scenario testing (`frontend/tests/e2e/`), and cross-browser compatibility

### Coverage Requirements
- **Minimum Coverage**: ≥80% branch coverage across all test types
- **Critical Path Coverage**: 100% coverage for TrustDelta calculation, emotional resonance validation, payment processing, and AI output generation
- **Reporting**: Generate coverage reports in `backend/coverage/lcov-report/` and `frontend/coverage/`

### Test Organization and Structure
- **Backend Tests**: Organized by domain in `backend/tests/`
  - `backend/tests/routes/` - API endpoint tests
  - `backend/tests/services/` - Business logic and AI service tests
  - `backend/tests/middleware/` - Authentication, validation, and error handling tests
  - `backend/tests/webhooks/` - Make.com integration tests
  - `backend/tests/ai/` - AI output quality and hallucination tests
- **Frontend Tests**: Organized by journey stage in `frontend/src/tests/`
  - Component tests for each F1-F9 stage
  - Hook tests in `frontend/src/tests/hooks/`
  - Integration tests in `frontend/tests/integration/`
  - E2E tests in `frontend/tests/e2e/`

### Test Naming Conventions
- **Test IDs**: Use PRD-aligned test IDs (e.g., `F1-tests`, `F2-tests`, `F8-tests`) for UI and API tests
- **Descriptive Names**: Follow pattern `should [expected behavior] when [conditions] for [context]`
- **Scenario References**: Include PRD scenario names (e.g., `Sprinkle Haven Bakery`, `Serenity Yoga Studio`)

## AI Output Testing

### Unit Tests
- **Location**: `backend/tests/ai/`
- **Coverage**: AI service functions, prompt validation, output quality scoring
- **Requirements**:
  - Test GPT-4o integration (`backend/services/gpt4o.js`)
  - Validate Hume AI emotional resonance scoring (`backend/services/hume.js`)
  - Test TrustDelta calculation algorithms
  - Verify output word count validation (700-800 for BUSINESS_BUILDER)

### Integration Tests
- **Location**: `backend/tests/api.test.js`
- **Coverage**: End-to-end AI workflow testing
- **Requirements**:
  - Test complete generation pipeline from input to output
  - Validate API response schemas and timing
  - Test fallback mechanisms (Hume AI quota exceeded → GPT-4o fallback)

### Hallucination Tests
- **Location**: `backend/tests/ai/hallucination.test.js`
- **Purpose**: Detect and prevent AI hallucinations in generated content
- **Requirements**:
  - Test factual accuracy in business plans
  - Validate consistency between input and output
  - Test contradiction detection algorithms
  - Verify NSFW content filtering

### Performance Tests
- **Location**: `backend/tests/performance.test.js`
- **Requirements**:
  - Validate <2s response times for deliverable generation
  - Test <1.5s response times for spark generation
  - Verify <200ms response times for API endpoints
  - Load test with 10,000 concurrent users

### Adversarial Prompt Testing
- **Location**: `backend/tests/adversarial_prompts.test.js`
- **Purpose**: Proactively identify AI hallucination and bias through adversarial inputs
- **Requirements**:
  - Test prompt injection attempts
  - Validate bias detection in outputs
  - Test edge cases and malformed inputs
  - Verify security measures against adversarial attacks

### Semantic Similarity Testing
- **Location**: `backend/tests/semantic.test.js`
- **Purpose**: Ensure consistency in meaning and intent across AI-generated text
- **Requirements**:
  - Test semantic consistency between multiple generations
  - Validate intent preservation from input to output
  - Test emotional tone consistency
  - Verify brand voice alignment

### Regression Testing for Qualitative Metrics
- **Location**: `backend/tests/quality_regression.test.js`
- **Purpose**: Automate regression tests for TrustDelta and resonance baselines
- **Requirements**:
  - Establish baseline metrics for each product type
  - Test TrustDelta ≥4.2 maintenance across updates
  - Validate emotional resonance >0.7 consistency
  - Monitor quality degradation over time

## Scenario Testing

### PRD Scenario Validation
- **Sprinkle Haven Bakery** (Business Plan Builder):
  - Test $75,000 funding plan generation
  - Validate Denver competitor analysis
  - Verify 700-800 word count compliance
  - Test financial projections accuracy
- **Serenity Yoga Studio** (Social Media & Email Campaign):
  - Test 3-7 social media posts generation
  - Validate 3-5 email campaign creation
  - Test community engagement tone
- **TechTrend Innovations** (Website Audit & Feedback):
  - Test website analysis functionality
  - Validate 300-400 word audit reports
  - Test strategic recommendations (100-150 words)

### Edge Case Testing
- **F2-E1**: Validation failure in 2-Step Discovery Funnel
- **F3-E1**: Spark generation timeout or failure
- **F7-E1**: Deliverable generation timeout
- **F8-E1**: SparkSplit comparison failure
- **Payment Failures**: Stripe integration error handling
- **Rate Limiting**: 100 requests/minute violation testing

### Pass Rate Requirements
- **95% Pass Rate**: For all scenario tests
- **100% Pass Rate**: For critical path scenarios (payment, deliverable generation)
- **Recovery Testing**: Validate error recovery and retry mechanisms

## Testing Tools and Configuration

### Backend Testing Stack
- **Jest/Vitest**: Unit and integration testing framework
- **Supertest**: HTTP assertion library for API testing
- **Coverage**: V8 provider with 80% threshold configured in `backend/vitest.config.ts`
- **Mocking**: Comprehensive mocking for external services (GPT-4o, Hume AI, Stripe)

### Frontend Testing Stack
- **Vitest**: Unit testing framework
- **React Testing Library**: Component testing utilities
- **MSW**: Mock Service Worker for API mocking
- **Cypress**: End-to-end testing framework

### Accessibility Testing
- **axe-core**: Automated accessibility testing
- **pa11y-ci**: Command-line accessibility testing
- **Requirements**:
  - WCAG 2.2 AA compliance (0 critical issues)
  - ≥4.5:1 contrast ratio validation
  - 100% VoiceOver navigability
  - ≥48px tap target validation

### Load Testing
- **Locust**: Load testing framework
- **Requirements**:
  - 10,000 concurrent users simulation
  - <2s response time maintenance
  - <1% error rate tolerance
  - Critical endpoint prioritization

### CI/CD Integration
- **Automated Testing**: All tests run in CI/CD pipeline
- **Coverage Enforcement**: Fail builds below 80% coverage
- **Performance Monitoring**: Track test execution times
- **Shard Testing**: Optimize for <10min CI runs

## Test Data Management

### Fixtures and Seeds
- **Deterministic Seeds**: Use consistent test data in `databases/seed/`
- **Scenario Data**: Maintain PRD scenario data (e.g., `sprinkle_haven.json`)
- **Mock Data**: Standardized mock responses for AI services
- **Data Cleanup**: Ensure test isolation and cleanup

### Environment Management
- **Test Environment**: Isolated test database and services
- **Environment Variables**: Separate test configuration
- **Service Mocking**: Mock external services in test environment

## Validation and Monitoring

### CI/CD Validation
- **Coverage Reports**: Generate and validate coverage reports
- **Test Results**: Track test execution and results
- **Performance Metrics**: Monitor test execution performance
- **Quality Gates**: Enforce quality standards before deployment

### Analytics and Monitoring
- **PostHog Events**: Track test execution metrics
  - `test_completed`: Test suite completion
  - `test_failed`: Test failure tracking
  - `coverage_report`: Coverage metrics
- **Sentry Integration**: Error tracking and monitoring
- **Performance Tracking**: Monitor test execution times and resource usage

## Quality Assurance Standards

### Code Quality
- **Test Code Standards**: Apply same quality standards to test code
- **Documentation**: Comprehensive test documentation
- **Maintainability**: Easy to understand and maintain tests
- **Reusability**: Shared test utilities and helpers

### Continuous Improvement
- **Test Review**: Regular test suite review and optimization
- **Metric Tracking**: Monitor test effectiveness and coverage
- **Feedback Loop**: Incorporate feedback into test improvements
- **Best Practices**: Stay updated with testing best practices

## Implementation Guidelines

### Test-Driven Development
- **Write Tests First**: Implement tests before functionality
- **Red-Green-Refactor**: Follow TDD cycle
- **Behavior-Driven**: Focus on behavior rather than implementation

### Test Organization
- **Logical Grouping**: Group related tests together
- **Clear Structure**: Maintain clear test file organization
- **Naming Conventions**: Use consistent naming patterns
- **Documentation**: Document complex test scenarios

### Performance Optimization
- **Parallel Execution**: Run tests in parallel where possible
- **Selective Testing**: Run relevant tests for changes
- **Resource Management**: Optimize test resource usage
- **Caching**: Use test result caching effectively

## References

- **PRD Section 13**: Testing Strategy requirements and specifications
- **Project Structure**: `backend/tests/`, `frontend/tests/`, `databases/seed/`
- **Coverage Reports**: `backend/coverage/`, `frontend/coverage/`
- **CI/CD Pipeline**: `.github/workflows/test.yml`

## Technical Notes

- **Target Directories**: `backend/tests/`, `frontend/src/tests/`, `frontend/tests/`
- **Supported Stack**: Next.js, Supabase, Jest/Vitest, axe-core, Locust, PostHog, Sentry
- **Performance Targets**: <2s response time, <100ms error responses, 99.9% uptime
- **Quality Metrics**: >80% coverage, TrustDelta ≥4.2, emotional resonance >0.7

---

**Updated**: December 18, 2025 at 8:38 AM MDT  
**Version**: 2.0.0  
**Compliance**: PRD Section 13, WCAG 2.2 AA, TaskMaster-compatible







