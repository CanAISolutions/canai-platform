---
description: 
globs: 
alwaysApply: true
---
# CanAI GitHub Repository Management Rules

## Purpose
Standardize GitHub repository management for the **CanAI Emotional Sovereignty Platform**, ensuring consistent collaboration, code quality, and alignment with the 9-stage user journey (F1-F9) across backend APIs (`backend/routes/`), frontend components (`frontend/src/`), and integrations.

## Standards

### Repository Structure
- **Organize by Function**: Use standardized structure:
  - `backend/` - Express.js APIs, middleware, services, webhooks
  - `frontend/` - React/Next.js application with 9-stage journey components
  - `databases/` - Supabase schemas, migrations, and seed data
  - `docs/` - Project documentation and guides
  - `packages/` - Shared configurations and TypeScript configs
  - `.github/workflows/` - CI/CD automation and quality gates

### Branch Naming Conventions
- **Stage-Based Naming**: Use `{type}/f{stage}-{feature}` format aligned with 9-stage journey:
  - `feature/f1-discovery-hook` - F1: Discovery Hook implementation
  - `feature/f2-discovery-funnel` - F2: 2-Step Discovery Funnel
  - `feature/f3-spark-layer` - F3: Spark Layer generation
  - `feature/f4-purchase-flow` - F4: Purchase Flow and Stripe integration
  - `feature/f5-detailed-input` - F5: Detailed Input Collection
  - `feature/f6-intent-mirror` - F6: Intent Mirror validation
  - `feature/f7-deliverable-gen` - F7: Deliverable Generation
  - `feature/f8-spark-split` - F8: SparkSplit comparison
  - `feature/f9-feedback-capture` - F9: Feedback Capture
  - `fix/f{stage}-{issue}` - Bug fixes for specific stages
  - `hotfix/critical-{description}` - Critical production fixes
  - `chore/infrastructure-{description}` - Infrastructure and tooling updates

### Pull Request Requirements
- **Mandatory Elements**:
  - **Title**: Clear, descriptive with stage reference (e.g., "F3: Implement spark regeneration with GPT-4o fallback")
  - **Description**: Include problem, solution, testing approach, and performance impact
  - **Linked Issue**: Reference GitHub issue with priority and type tags
  - **TaskMaster ID**: Reference specific TaskMaster task (e.g., `T8.1.1-backend-setup`)
  - **API Changes**: Document new/modified endpoints from Section 8.7 API catalog
  - **Performance Impact**: Note latency targets (<2s generation, <100ms errors)
  - **Security Review**: Confirm RLS policies, input validation, and GDPR compliance
- **Review Requirements**: Minimum one approval from codeowner before merge
- **Pre-merge Validation**: All CI/CD checks must pass (tests, linting, security scans)

### Code Review Standards
- **Response Time**: Complete reviews within 24 hours; escalate via PagerDuty for delays
- **Review Criteria**:
  - **PRD Alignment**: Verify compliance with 9-stage journey requirements
  - **Performance**: Ensure <2s response times for critical endpoints
  - **Security**: Validate Supabase RLS, input sanitization, authentication
  - **Testing**: Require >80% coverage with Jest/Supatest
  - **Accessibility**: Confirm WCAG 2.2 AA compliance (≥4.5:1 contrast, ARIA labels)
  - **API Consistency**: Follow Section 8.7 API catalog patterns
  - **Error Handling**: Implement <100ms empathetic error responses

### AI Code Review
- **AI Review Checklist**: Required for all PR reviews involving AI-generated code:
  - **Format Compliance**: Verify code matches project TypeScript standards and naming conventions
  - **Edge Case Handling**: Ensure proper error handling for GPT-4o timeouts, Hume AI rate limits, Stripe failures
  - **Hallucination Prevention**: Validate API endpoints exist, database schemas are correct, file paths are accurate
  - **PRD Alignment**: Confirm AI-generated code adheres to 9-stage journey requirements and performance targets
  - **Integration Validity**: Verify Supabase, Make.com, and external API integrations are properly implemented
  - **Security Patterns**: Ensure RLS policies, input validation, and authentication are correctly applied

### Human Oversight Requirements
- **Mandatory Human Review**: All AI-generated code must have human oversight before merge
- **Senior Developer Approval**: AI-generated backend APIs, database schemas, and security implementations require senior developer review
- **Documentation Verification**: Human reviewers must validate that AI-generated documentation is accurate and complete
- **Performance Validation**: Human oversight required for performance-critical code (API endpoints, database queries)
- **Security Audit**: Manual security review mandatory for AI-generated authentication, authorization, and data handling code

### Issue Tracking and Management
- **GitHub Issues**: Use comprehensive tagging system:
  - **Priority**: `priority:critical`, `priority:high`, `priority:medium`, `priority:low`
  - **Type**: `type:bug`, `type:feature`, `type:enhancement`, `type:security`
  - **Stage**: `stage:f1` through `stage:f9` for journey-specific issues
  - **Component**: `component:backend`, `component:frontend`, `component:database`
  - **Integration**: `integration:supabase`, `integration:stripe`, `integration:gpt4o`, `integration:hume-ai`
- **Issue Templates**: Standardized templates for bugs, features, and security issues
- **Epic Tracking**: Link related issues to epic milestones for major features

### Collaboration and Communication
- **GitHub Discussions**: Use for architectural decisions, technical planning, and PRD clarification
- **Documentation**: Maintain up-to-date technical documentation in `docs/` folder
- **Architecture Decision Records (ADRs)**: Document significant technical decisions
- **Stakeholder Communication**: Tag appropriate reviewers based on component ownership

## Validation and Automation

### CI/CD Pipeline Enforcement
- **Automated Validation**: `.github/workflows/pr.yml` enforces:
  - Branch naming compliance with stage-based format
  - PR template completion and required fields
  - TaskMaster ID validation and task alignment
  - Performance benchmark validation
- **Quality Gates**: 
  - ESLint validation (`.github/workflows/lint.yml`)
  - Jest unit tests with >80% coverage requirement
  - Supatest integration tests for API endpoints
  - Security scans with OWASP ZAP and Semgrep
  - Accessibility testing with axe-core

### Repository Health Monitoring
- **TaskMaster Alignment**: Automated checks ensure GitHub issues align with TaskMaster tasks
- **Analytics Integration**: PostHog tracking for development metrics:
  - `pr_created` - Pull request creation with stage and component
  - `pr_merged` - Successful merge with review duration
  - `issue_resolved` - Issue closure with resolution time
  - `security_scan_passed` - Security validation completion
- **Performance Monitoring**: Sentry integration for deployment health tracking

### Compliance and Security
- **Secret Scanning**: Enabled GitHub secret scanning with custom patterns for API keys
- **Dependency Management**: Automated vulnerability scanning and updates
- **License Compliance**: Automated license compatibility validation
- **Data Privacy**: GDPR/CCPA compliance validation for user data handling

## Workflow Integration

### Development Workflow Alignment
- **9-Stage Journey Mapping**: Each development phase aligns with user journey stages
- **Backend-First Development**: API endpoints developed before frontend integration
- **Integration Testing**: Comprehensive testing with Supabase, Stripe, GPT-4o, and Hume AI
- **Performance Validation**: Continuous monitoring of <2s response targets

### Release Management
- **Semantic Versioning**: Follow semver for all releases with detailed changelogs
- **Feature Flags**: Use for gradual rollout of new functionality
- **Rollback Procedures**: Documented procedures for quick production rollbacks
- **Deployment Gates**: Staged deployment with validation at each level

## Development Guidance and Anti-Patterns

### Communication Standards
- **Professional Tone**: Maintain confident, technical communication without apologies or confirmations
- **Direct Implementation**: Focus on delivering functional code without placeholders or TODOs
- **PRD Compliance**: Ensure all changes align with documented requirements and performance targets
- **Error Prevention**: Implement comprehensive validation and error handling patterns

### Code Quality Requirements
- **No Placeholders**: Reject temporary implementations, mocks, or TODO comments
- **Performance First**: All code must meet <2s response and <100ms error targets
- **Security by Design**: Implement RLS, input validation, and authentication from start
- **Testing Required**: Minimum >80% coverage with unit, integration, and accessibility tests

### Documentation Standards
- **Technical Precision**: All documentation must include specific file paths and implementation details
- **API Documentation**: Document all endpoints with examples and schema validation
- **Architecture Records**: Maintain decision logs for significant technical choices
- **Update Protocols**: Keep documentation current with code changes

## Error Prevention and Quality Assurance

### Anti-Patterns Prevention
- **No PRD Drift**: Require explicit approval for changes outside documented scope
- **No Performance Regression**: Automated benchmarking prevents latency increases
- **No Security Bypass**: Mandatory review for authentication/authorization changes
- **No Incomplete Implementation**: All features must be fully functional before merge

### Quality Standards
- **Code Documentation**: JSDoc for all functions with examples and parameter descriptions
- **Error Handling**: Comprehensive error handling with empathetic user messaging
- **Testing Requirements**: Unit, integration, and accessibility tests for all changes
- **Performance Benchmarks**: Automated performance regression detection

## References and Alignment

### PRD Sections
- **Section 8.7**: API Catalog compliance for endpoint consistency
- **Section 13**: Testing Strategy implementation requirements
- **Section 14**: Security Strategy and compliance standards
- **Section 15**: Deployment Strategy and pipeline automation
- **Section 16**: Risk Assessment and mitigation procedures

### Project Structure
- **Backend**: `backend/api/`, `backend/routes/`, `backend/services/`, `backend/webhooks/`
- **Frontend**: `frontend/src/pages/`, `frontend/src/components/`, organized by 9-stage journey
- **Database**: `databases/migrations/`, `databases/seed/` with Supabase schemas
- **Documentation**: `docs/` with technical guides and API specifications

## Technical Implementation

### Automation Requirements
- **Pre-commit Hooks**: Validate branch naming, commit messages, and code quality
- **CI/CD Integration**: Comprehensive validation pipeline with security and performance gates
- **Automated Testing**: Full test suite execution with coverage reporting and accessibility validation
- **Performance Monitoring**: Continuous latency and error rate tracking

### Monitoring and Observability
- **Development Metrics**: Track velocity, review efficiency, and issue resolution times
- **Code Quality**: Monitor test coverage, complexity scores, and technical debt
- **Security Tracking**: Automated vulnerability scanning and compliance validation
- **Performance Analytics**: Real-time monitoring of response times and error rates

---

## Version History
- **Version 1.0.0**: Initial GitHub rules aligned with PRD requirements
- **Version 2.0.0**: Enhanced with 9-stage journey alignment and comprehensive workflow standards
- **Updated**: Current version aligned with project structure mapping and backend-focused development approach

## Technical Notes
- **Applies to**: All repository components including `backend/`, `frontend/`, `databases/`, `docs/`, `.github/workflows/`
- **Technology Stack**: Express.js, React/Next.js, Supabase, Make.com, Stripe, GPT-4o, Hume AI, PostHog, Sentry
- **Performance Targets**: <2s response time, <100ms error responses, 99.9% uptime, >80% test coverage
- **Security Standards**: Supabase RLS, input validation, GDPR/CCPA compliance, MemberStack authentication
- **Updated**: Enhanced to align with 9-stage user journey and comprehensive development workflow
- **Version**: 2.0.0 - Comprehensive GitHub governance aligned with PRD requirements











