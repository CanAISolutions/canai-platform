# API Contract Specification - CanAI Emotional Sovereignty Platform

## Purpose

Exhaustively documents all 25 CanAI API endpoints, ensuring Cursor AI implements consistent,
error-free integrations. Prevents integration failures by specifying endpoints, schemas, error
codes, and dependencies.

## Structure

- **API Overview**: Base URL, versioning, authentication, and security.
- **Endpoints**: Complete list of APIs (F1–F9, security, admin, future).
- **Schemas**: Request/response formats, error codes.
- **Integration Details**: Dependencies and behaviors.
- **Examples**: PRD-aligned request/response pairs.

## API Overview

- **Base URL**: `https://canai-router.onrender.com:10000/v1`
- **Versioning**: SemVer (`v1.0.0`).
- **Authentication**:
  - None: F1–F2, `/v1/consent`, `/v1/purge-data`.
  - Memberstack JWT: F3–F9, `/v1/export`, `/v1/refer`, `/v1/resume`.
  - Admin JWT: `/v1/admin-metrics`.
- **Rate Limit**: 100 req/min/IP (`backend/middleware/rateLimit.js`).
- **Sanitization**: DOMPurify for inputs (`backend/middleware/validation.js`).
- **Error Handling**: <100ms, standardized error schema (`backend/middleware/error.js`).
- **Caching**: Node-cache for responses (e.g., `trust_indicators_cache`, TTL: 5min).

## Endpoints

| Stage    | Method | Path                    | Auth      | Description                                        |
| -------- | ------ | ----------------------- | --------- | -------------------------------------------------- |
| F1       | GET    | /messages               | None      | Fetches trust indicators                           |
| F1       | GET    | /pricing                | None      | Retrieves pricing data                             |
| F1       | POST   | /log-interaction        | None      | Logs UI interactions                               |
| F1       | POST   | /generate-preview-spark | None      | Generates free spark preview                       |
| F2       | POST   | /validate-input         | None      | Validates funnel inputs, returns trust score       |
| F2       | POST   | /generate-tooltip       | None      | Generates dynamic tooltips                         |
| F2       | POST   | /detect-contradiction   | None      | Flags tone/outcome mismatches                      |
| F2       | POST   | /filter-input           | None      | Filters inappropriate inputs                       |
| F3       | POST   | /generate-sparks        | JWT       | Generates three spark concepts                     |
| F3       | POST   | /regenerate-sparks      | JWT       | Regenerates sparks (max 3/4 attempts)              |
| F4       | POST   | /stripe-session         | JWT       | Initiates Stripe checkout                          |
| F4       | POST   | /refund                 | JWT       | Processes refunds                                  |
| F4       | POST   | /switch-product         | JWT       | Switches product tracks                            |
| F5       | POST   | /save-progress          | JWT       | Saves detailed inputs                              |
| F5/F7    | GET    | /resume                 | JWT       | Resumes input collection or deliverable generation |
| F6       | POST   | /intent-mirror          | JWT       | Generates input summary                            |
| F7       | POST   | /deliverable            | JWT       | Generates deliverables                             |
| F7       | GET    | /generation-status      | JWT       | Checks deliverable status                          |
| F7       | POST   | /request-revision       | JWT       | Requests deliverable revisions                     |
| F7       | POST   | /regenerate-deliverable | JWT       | Regenerates deliverables (max 2 attempts)          |
| F8       | POST   | /spark-split            | JWT       | Compares CanAI vs. generic output                  |
| F9       | POST   | /feedback               | JWT       | Captures user feedback                             |
| F9       | POST   | /refer                  | JWT       | Generates referral links                           |
| Security | POST   | /consent                | None      | Logs GDPR/CCPA consent                             |
| Security | POST   | /purge-data             | JWT       | Deletes user data                                  |
| Admin    | GET    | /admin-metrics          | Admin JWT | Provides admin metrics                             |
| Future   | POST   | /export                 | JWT       | Exports deliverables to CRM                        |

## Schemas and Examples

### GET /v1/messages (F1)

- **Request**: `{}`
- **Response**:
  ```json
  {
    "messages": [{ "text": "CanAI launched my bakery!", "user_id": "uuid|null" }],
    "error": null
  }
  ```
- **Errors**:
  ```json
  [
    { "error": { "code": 429, "message": "Rate limit exceeded" } },
    { "error": { "code": 500, "message": "Internal server error" } }
  ]
  ```
- **Example**:
  - Request: `GET /v1/messages`
  - Response: `{ "messages": [{ "text": "500+ plans created" }], "error": null }`

### POST /v1/validate-input (F2)

- **Request**:
  ```json
  {
    "businessType": "retail",
    "otherType": "string|null",
    "primaryChallenge": "Need funding",
    "preferredTone": "warm",
    "customTone": "string|null",
    "desiredOutcome": "secure funding"
  }
  ```
- **Response**:
  ```json
  {
    "valid": true,
    "feedback": "Clear funding goal!",
    "trustScore": 85,
    "error": null
  }
  ```
- **Errors**:
  ```json
  [
    { "error": { "code": 400, "message": "Invalid businessType" } },
    { "error": { "code": 429, "message": "Rate limit exceeded" } }
  ]
  ```
- **Example**:
  - Request: `POST /v1/validate-input { "businessType": "retail", "primaryChallenge": "Need $75k" }`
  - Response: `{ "valid": true, "feedback": "Funding goal clear", "trustScore": 85 }`

### POST /v1/generate-sparks (F3)

- **Request**:
  ```json
  {
    "businessType": "retail",
    "tone": "warm",
    "outcome": "secure funding",
    "initial_prompt_id": "uuid"
  }
  ```
- **Response**:
  ```json
  {
    "sparks": [
      { "title": "Community Spark", "tagline": "Unite Denver families" },
      { "title": "Growth Spark", "tagline": "Expand your bakery" },
      { "title": "Vision Spark", "tagline": "Inspire investors" }
    ],
    "error": null
  }
  ```
- **Example**:
  - Request: `POST /v1/generate-sparks { "businessType": "retail", "tone": "warm" }`
  - Response:
    `{ "sparks": [{ "title": "Community Spark", "tagline": "Unite Denver" }], "error": null }`

### POST /v1/stripe-session (F4)

- **Request**:
  ```json
  {
    "spark": {
      "title": "Community Spark",
      "product_track": "business_builder"
    },
    "user_id": "uuid",
    "spark_log_id": "uuid"
  }
  ```
- **Response**:
  ```json
  { "session": { "id": "cs_test_123" }, "error": null }
  ```
- **Example**:
  - Request: `POST /v1/stripe-session { "spark": { "title": "Community Spark" }, "user_id": "123" }`
  - Response: `{ "session": { "id": "cs_test_abc" }, "error": null }`

### POST /v1/deliverable (F7)

- **Request**:
  ```json
  {
    "prompt_log_id": "uuid",
    "user_id": "uuid",
    "product_track": "business_builder",
    "businessDescription": "string"
  }
  ```
- **Response**:
  ```json
  {
    "canaiOutput": "700–800-word business plan",
    "genericOutput": "Generic AI plan",
    "pdfUrl": "supabase/storage/deliverables/plan.pdf",
    "emotionalResonance": { "arousal": 0.6, "valence": 0.7 },
    "error": null
  }
  ```
- **Example**:
  - Request:
    `POST /v1/deliverable { "product_track": "business_builder", "businessDescription": "Bakery in Denver" }`
  - Response: `{ "canaiOutput": "Sprinkle Haven plan...", "pdfUrl": "url", "error": null }`

## Integration Details

- **Supabase**: Stores data in tables like `prompt_logs`, `spark_logs`, `comparisons`
  (`backend/services/supabase.js`).
- **GPT-4o**: Powers validation (`/v1/validate-input`), spark generation (`/v1/generate-sparks`),
  summaries (`/v1/intent-mirror`), and deliverables (`/v1/deliverable`)
  (`backend/services/gpt4o.js`).
- **Hume AI**: Validates emotional resonance (arousal >0.5, valence >0.6) for F2, F7
  (`backend/services/hume.js`), with circuit breaker fallback to GPT-4o (`middleware/hume.js`).
- **Stripe**: Handles payments, refunds, and product switches (`/v1/stripe-session`, `/v1/refund`,
  `/v1/switch-product`) (`backend/services/stripe.js`).
- **Make.com**: Orchestrates webhooks (e.g., `add_project.json`, `log_interaction.js`)
  (`backend/webhooks/`).
- **Memberstack**: Provides JWT authentication (`backend/services/memberstack.js`).
- **PostHog**: Logs events (e.g., `funnel_step`, `spark_selected`) (`backend/services/posthog.js`).
- **Sentry**: Tracks errors (`backend/services/sentry.js`).
