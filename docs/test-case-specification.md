# Test Case Specification - CanAI Emotional Sovereignty Platform

## Purpose

Defines comprehensive tests to validate CanAI’s functionality, performance, and quality. Prevents
bugs and regressions by enforcing PRD-specified test criteria.

## Structure

- **Test Types**: Unit, integration, accessibility, emotional resonance, load, scenario.
- **Test Cases**: Scenarios for all 25 APIs and services.
- **Tools**: Jest, Supatest, axe-core, Locust, Hume AI.
- **Coverage Goals**: PRD-aligned metrics (>80% unit, 95% scenario pass rate).

## Test Types

- **Unit Tests**: Validate backend logic for APIs (`backend/routes/`), services
  (`backend/services/`), and middleware (`backend/middleware/`).
- **Integration Tests**: Test API flows (F1–F9) with Supabase, Stripe, GPT-4o, Hume AI, and Make.com
  (`backend/webhooks/`).
- **Accessibility Tests**: Ensure WCAG 2.2 AA compliance for Webflow UI (`frontend/public/`).
- **Emotional Resonance Tests**: Validate outputs with Hume AI (arousal >0.5, valence >0.6).
- **Load Tests**: Support 10,000 concurrent users with <2s response, <1% errors.
- **Scenario Tests**: Validate PRD scenarios (e.g., Sprinkle Haven Bakery) with 95% pass rate.

## Test Cases

### F1: GET /v1/messages

- **Input**: `GET /v1/messages`
- **Expected Output**:
  ```json
  { "messages": [{ "text": "500+ plans created" }], "error": null }
  ```
- **Tool**: Jest (`backend/tests/messages.test.js`, id=F1-tests)
- **Criteria**: Returns 200, <200ms response, cached for 5min.

### F2: POST /v1/validate-input

- **Input**: `POST /v1/validate-input {"businessType": "retail", "primaryChallenge": "Need $75k"}`
- **Expected Output**:
  ```json
  { "valid": true, "feedback": "Clear goal", "trustScore": 85 }
  ```
- **Tool**: Supatest (`backend/tests/api.test.js`, id=F2-tests)
- **Criteria**: Returns 200, <500ms, stores to `initial_prompt_logs`.

### F3: POST /v1/generate-sparks

- **Input**: `POST /v1/generate-sparks {"businessType": "retail", "tone": "warm"}`
- **Expected Output**:
  ```json
  { "sparks": [{ "title": "Community Spark", "tagline": "Unite Denver" }] }
  ```
- **Tool**: Supatest (`backend/tests/sparks.test.js`, id=F3-tests)
- **Criteria**: Returns 200, <1.5s, valence >0.6.

### F4: POST /v1/stripe-session

- **Input**: `POST /v1/stripe-session {"spark": {"title": "Community Spark"}, "user_id": "uuid"}`
- **Expected Output**:
  ```json
  { "session": { "id": "cs_test_123" }, "error": null }
  ```
- **Tool**: Supatest (`backend/tests/stripe.test.js`, id=F4-tests)
- **Criteria**: Returns 200, <1s, triggers `add_project.json`.

### F7: POST /v1/deliverable

- **Input**:
  `POST /v1/deliverable {"product_track": "business_builder", "businessDescription": "Bakery"}`
- **Expected Output**:
  ```json
  { "canaiOutput": "700-word plan", "emotionalResonance": { "valence": 0.7 } }
  ```
- **Tool**: Supatest (`backend/tests/deliverables.test.js`, id=F7-tests)
- **Criteria**: Returns 200, <2s, arousal >0.5, valence >0.7.

### Middleware: Rate Limiting

- **Input**: 101 req/min to `/v1/messages`
- **Expected Output**:
  ```json
  { "error": { "code": 429, "message": "Rate limit exceeded" } }
  ```
- **Tool**: Jest (`backend/tests/rateLimit.test.js`)
- **Criteria**: Blocks excess requests, logs to `error_logs`.

### Service: GPT-4o Token Handling

- **Input**: 150K token input to `/v1/deliverable`
- **Expected Output**: Chunks input, logs `token_limit` to `error_logs`
- **Tool**: Jest (`backend/tests/gpt4o.test.js`)
- **Criteria**: Handles overflow with MapReduce.

## Tools

- **Jest**: Unit tests (`backend/tests/*.test.js`), coverage reports in `backend/coverage/`.
- **Supatest**: Integration tests (`backend/tests/api.test.js`), using `databases/seed/`.
- **axe-core/pa11y-ci**: Accessibility tests (`backend/tests/accessibility.test.js`).
- **Hume AI**: Resonance validation (`backend/services/hume.js`).
- **Locust**: Load tests (`backend/tests/load.py`).
- **VoiceOver**: Manual screen reader tests (`backend/tests/accessibility-report.md`).

## Coverage Goals

- **Unit**: >80% coverage.
- **Integration**: 100% endpoint coverage.
- **Accessibility**: 0 critical WCAG 2.2 AA issues, ≥4.5:1 contrast.
- **Resonance**: 95% deliverables meet arousal >0.5, valence >0.6.
- **Load**: 10,000 users, <2s response, <1% errors.
- **Scenario**: 95% pass rate for PRD scenarios.
