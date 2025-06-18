---
description: 
globs: 
alwaysApply: true
---
# CanAI LLM Rules

## Purpose
Ensure responsible, efficient, and safe LLM deployments with cost optimization, emotional resonance validation, and comprehensive safety measures for the CanAI Emotional Sovereignty Platform.

## Standards

### Input Validation
- **Zod Validation**: Validate all LLM inputs with Zod schemas before processing (`backend/middleware/validation.js`, PRD Table 4).
- **Token Limits**: Enforce 128K token limit per request; prioritize `businessDescription`, `primaryGoal` for chunking (`backend/prompts/`).
- **NSFW Detection**: Reject inappropriate content via `POST /v1/filter-input` (`backend/routes/validation.js`).
- **Prompt Injection Protection**: 
  ```ts
  const isSafePrompt = runPromptFilter(userInput);
  if (!isSafePrompt) {
    posthog.capture('prompt_blocked', { input: userInput });
    return { error: 'Unsafe prompt rejected' };
  }
  ```

### Privacy & Data Protection
- **PII Redaction**: Redact personally identifiable information using `backend/services/anonymize.js`.
- **Data Retention**: Store LLM interactions in `databases/prompt_logs` with 24-month retention policy.
- **Supabase RLS**: Enforce Row-Level Security for all LLM-related data access.

### Rate Limits & Cost Controls
- **GPT-4o Limits**: Respect 128K tokens/request, $5/1M tokens budget (PRD Section 7.6).
- **Hume AI Circuit Breaker**: Enforce >900 req/day limit (`backend/middleware/hume.js`):
  ```ts
  const dailyUsage = await getHumeUsage(); // Supabase query
  if (dailyUsage >= 900) {
    // Fallback to GPT-4o with -0.2 TrustDelta penalty
    posthog.capture('hume_fallback_triggered', { usage: dailyUsage, fallback_reason: 'limit_exceeded' });
    return await fallbackToGPT4oSentiment(input);
  }
  ```
- **Cost Tracking**: Log usage in `databases/usage_logs` with monthly budget alerts (<$150 combined).

### LLM Configuration
- **Temperature**: Set 0.5 default unless task explicitly requires higher creativity (0.7-0.8 for creative content).
- **Model Selection**: Use GPT-4o for all primary LLM tasks (`backend/services/gpt4o.js`).
- **Timeout Handling**: Implement 30s timeout with exponential backoff (3 retries, 2^i * 1000ms delay).

### Safety & Bias Prevention
- **Harmful Content Detection**: Prevent generation of harmful, biased, or inappropriate outputs.
- **Bias Detection Pipeline**: Integrate bias detection tools into LLM generation pipeline:
  ```ts
  const biasScore = await detectBias(generatedContent);
  if (biasScore > 0.7) {
    posthog.capture('bias_detected', { score: biasScore, content_type: 'deliverable' });
    return await regenerateWithBiasCorrection(input);
  }
  ```
- **Content Filtering**: Validate outputs against safety guidelines before delivery.

### Emotional Resonance & Quality
- **Hume AI Validation**: Check emotional resonance (>0.7), arousal (>0.5), valence (>0.6).
- **TrustDelta Requirements**: Achieve TrustDelta ≥4.0/5.0 for all deliverables.
- **Confidence Thresholds**: 
  - High-stakes deliverables require minimum AI confidence score >0.8
  - Trigger AI-in-the-Loop human review if confidence <0.8 after 2 attempts
  - Log low confidence events: `posthog.capture('low_confidence_triggered', { confidence: 0.7, attempts: 2 })`

### Graceful Degradation
- **Timeout Recovery**: For `/v1/deliverable` >15s, return partial output and send resume link via `send_email.json`.
- **Fallback Strategies**: 
  - Hume AI failure → GPT-4o sentiment analysis (-0.2 TrustDelta)
  - GPT-4o timeout → Cached response from `databases/spark_cache` (TTL: 5min)
  - Complete failure → User-friendly error with retry option

### Output Validation & Structure
- **Schema Validation**: Validate all LLM outputs against expected schemas:
  ```ts
  const result = schema.safeParse(jsonOutput);
  if (!result.success) {
    posthog.capture('schema_validation_failed', { errors: result.error.issues });
    throw new Error("Invalid output schema");
  }
  ```
- **Word Count Compliance**: Enforce PRD word counts (e.g., 700–800 words for BUSINESS_BUILDER).
- **Format Consistency**: Ensure outputs match expected format (JSON, markdown, plain text).

### Code Generation Standards
- **Inline Comments**: Require inline comments in generated code explaining any API/library used.
- **Documentation**: Include JSDoc comments for all generated functions.
- **Best Practices**: Follow TypeScript and React best practices in generated code.

### Performance Optimization
- **Response Times**: Target <2s for deliverable generation, <1.5s for spark generation.
- **Caching Strategy**: Cache frequent prompts and responses in `databases/spark_cache` (TTL: 5min).
- **Streaming**: Use Server-Sent Events (SSE) for long-running generations (>2s).

### Monitoring & Logging
- **Usage Tracking**: Log all LLM interactions in `databases/usage_logs`:
  ```sql
  CREATE TABLE usage_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service TEXT NOT NULL, -- 'gpt4o' | 'hume'
    tokens_used INTEGER,
    cost NUMERIC NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```
- **PostHog Events**: Track key LLM metrics:
  - `llm_request_made` - All LLM requests
  - `llm_cost_exceeded` - Budget warnings
  - `hume_fallback_triggered` - Circuit breaker activations
  - `partial_output_sent` - Graceful degradation events
  - `bias_detected` - Content safety issues
  - `low_confidence_triggered` - Quality concerns

### Error Handling
- **Structured Errors**: Return consistent error format:
  ```ts
  {
    error: string,
    code: number,
    details: object|null,
    correlationId: string,
    fallback?: string // Available fallback option
  }
  ```
- **Error Logging**: Log all LLM errors to `databases/error_logs` with context.
- **User Communication**: Provide empathetic error messages (e.g., "We're sparking your ideas!" for timeouts).

### Prompt Engineering
- **Template Structure**: Organize prompts in `backend/prompts/`:
  - `funnel.js` - Discovery funnel validation
  - `sparks.js` - Spark generation
  - `intent.js` - Intent mirror summaries
  - `deliverables.js` - Final output generation
- **Tone Injection**: Support dynamic tone configuration (warm, bold, optimistic, professional, playful, inspirational, custom).
- **Context Awareness**: Include relevant user context and emotional drivers in prompts.

### Integration Requirements
- **Make.com Compatibility**: Ensure LLM outputs integrate with Make.com scenarios (`backend/webhooks/make_scenarios/`).
- **Supabase Integration**: Store all LLM data with proper schemas and indexes.
- **PostHog Analytics**: Track all user interactions with LLM features.

## Validation

### CI/CD Enforcement
- **Input Validation**: CI/CD enforces input validation (`.github/workflows/llm.yml`).
- **Schema Testing**: Validate all LLM schemas in pre-commit hooks.
- **Safety Testing**: Run bias detection and safety tests on all prompt templates.

### Testing Requirements
- **Jest Coverage**: >80% test coverage for all LLM-related code (`backend/tests/llm.test.js`).
- **Safety Tests**: Verify content filtering, bias detection, and prompt injection protection.
- **Performance Tests**: Validate response times and token usage limits.
- **Fallback Tests**: Test graceful degradation scenarios.

### Monitoring Validation
- **PostHog Dashboards**: Monitor `llm_cost`, `hume_fallback_triggered`, `partial_output_sent` events.
- **Sentry Integration**: Track LLM errors and performance issues.
- **Cost Alerts**: Set up alerts for budget overruns and unusual usage patterns.

## File Structure
- **Backend Services**: `backend/services/gpt4o.js`, `backend/services/hume.js`
- **Middleware**: `backend/middleware/hume.js`, `backend/middleware/validation.js`
- **Database**: `databases/usage_logs`, `databases/prompt_logs`, `databases/spark_cache`
- **Prompts**: `backend/prompts/` (organized by feature)
- **Tests**: `backend/tests/llm.test.js`, `backend/tests/safety.test.js`

## References
- **PRD Sections**: 1, 6, 7.6, 8.4, 9, 16
- **Project Structure**: `backend/services/`, `backend/middleware/`, `databases/`
- **Performance Targets**: <2s response time, <100ms error responses, 99.9% uptime
- **Cost Limits**: <$150/month combined (GPT-4o + Hume AI)

## Version History
- **Version 2.0.0** - Comprehensive rewrite aligned with PRD and project structure
- **Updated**: Current date, comprehensive LLM safety and performance standards



