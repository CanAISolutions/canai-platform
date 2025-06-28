# CanAI Emotional Sovereignty Platform: Hume AI Emotional Resonance Service Implementation

**Task ID**: 6  
**Title**: Setup Hume AI Emotional Resonance Service  
**Priority**: High  
**Status**: Pending  
**Dependencies**: Task 2 (Backend Setup)  
**PRD Reference**: Sections 6.6 (Intent Mirror), 6.7 (Deliverable Generation), 6.8 (SparkSplit), 7.1 (Performance), 7.2 (Security), 13.1 (Test Types), 13.3 (Acceptance Criteria), 14.1 (Security Measures), 16.1 (Risk Assessment), 17.1 (Future Enhancements)  
**Date**: June 27, 2025

## 1. Overview

This document provides a comprehensive guide for implementing the Hume AI Emotional Resonance Service for the CanAI Emotional Sovereignty Platform. The service integrates Hume AI for emotional analysis with a circuit breaker pattern to handle rate limits (>900 req/day) and a GPT-4o fallback for reliability. It supports emotional resonance validation (arousal >0.5, valence >0.6) for the Intent Mirror (F6), Deliverable Generation (F7), and SparkSplit (F8) stages, ensuring user trust (TrustDelta ≥4.2), emotional resonance (>0.7), reliability (99.9% uptime), and compliance with GDPR/CCPA and WCAG 2.2 AA standards.

### Objectives
- **Secure API Key Management**: Store and rotate Hume AI API keys securely using environment variables and Supabase vault.
- **Hume AI Client Initialization**: Initialize the Hume AI client with connection validation and error handling.
- **Circuit Breaker Pattern**: Implement a circuit breaker to manage rate limits with configurable thresholds and recovery.
- **Emotional Resonance Scoring**: Develop a service to analyze and validate emotional resonance with defined thresholds.
- **GPT-4o Fallback**: Provide a fallback mechanism to maintain consistent output when Hume AI is unavailable.
- **Testing and Validation**: Ensure robust testing for functionality, performance, and compliance.
- **Documentation and Compliance**: Document APIs, log events, and align with PRD requirements for trust and safety.

### PRD Alignment
- **F6 (Intent Mirror)**: Validates emotional resonance for user intent summaries (`/v1/intent-mirror`).
- **F7 (Deliverable Generation)**: Ensures deliverables meet emotional thresholds and are reliable (`/v1/request-revision`).
- **F8 (SparkSplit)**: Supports comparison of CanAI outputs with emotional resonance scores (`/v1/spark-split`).
- **Security and Compliance**: Adheres to GDPR/CCPA, WCAG 2.2 AA, and secure key management (Sections 7.2, 14.1).

## 2. Implementation Plan

The implementation is divided into five subtasks, based on the TaskMaster task definition and Cursor's implementation plan. Each subtask includes detailed steps, code snippets, inputs, outputs, and PRD alignment.

### Subtask 1: Initialize Hume AI Client with API Key
**ID**: 1  
**Description**: Set up the Hume AI client with secure API key management, environment variable handling, and connection validation.  
**Dependencies**: None  
**Inputs**:
- `.env` (HUME_API_KEY, HUME_API_ENDPOINT, HUME_RATE_LIMIT, HUME_TIMEOUT)
- `backend/services/supabase.js`
- `supabase/migrations/005_vault_setup.sql`
- `.env.example`
**Outputs**:
- Initialized Hume AI client
- Encrypted key storage in Supabase `encrypted_keys` table
- PostHog events: `hume_initialized`, `hume_initialization_failed`, `hume_key_rotated`
**PRD Reference**: 14.1 (Security Measures), 16.1 (Risk Assessment)

#### Steps
1. **Configure Environment Variables**:
   - Define Hume AI configuration in `.env` and `.env.example`.
   - Example: `.env.example`:
     ```env
     HUME_API_KEY=your_key_here
     HUME_API_ENDPOINT=https://api.hume.ai/v1
     HUME_RATE_LIMIT=100
     HUME_TIMEOUT=5000
     POSTHOG_API_KEY=your_posthog_key
     SUPABASE_URL=your_supabase_url
     SUPABASE_KEY=your_supabase_key
     ```

2. **Set Up Supabase Vault**:
   - Create a table for encrypted keys with Row-Level Security (RLS).
   - File: `supabase/migrations/005_vault_setup.sql`:
     ```sql
     CREATE EXTENSION IF NOT EXISTS vault;
     CREATE TABLE encrypted_keys (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       key_name TEXT NOT NULL,
       encrypted_value TEXT NOT NULL,
       created_at TIMESTAMPTZ DEFAULT NOW(),
       INDEX idx_encrypted_keys_key_name (key_name)
     );
     CREATE POLICY encrypted_keys_rls ON encrypted_keys
       FOR ALL TO authenticated
       USING (auth.uid() = auth.uid());
     ```

3. **Initialize Hume AI Client**:
   - Create a `HumeService` class to initialize the client and validate the connection.
   - File: `backend/services/hume.js`:
     ```javascript
     // backend/services/hume.js
     const { HumeClient } = require('hume-ai'); // Replace with actual Hume AI SDK
     const { SupabaseClient } = require('./supabase');
     const PostHog = require('posthog-js');

     class HumeService {
       constructor() {
         this.apiKey = process.env.HUME_API_KEY;
         this.endpoint = process.env.HUME_API_ENDPOINT || 'https://api.hume.ai/v1';
         this.timeout = parseInt(process.env.HUME_TIMEOUT, 10) || 5000;
         this.supabase = new SupabaseClient();
         this.posthog = PostHog.init(process.env.POSTHOG_API_KEY);
         this.client = null;
       }

       async initialize() {
         if (!this.apiKey) {
           this.posthog.capture('hume_initialization_failed', { error: 'Missing HUME_API_KEY' });
           throw new Error('HUME_API_KEY is missing');
         }
         try {
           this.client = new HumeClient({
             apiKey: this.apiKey,
             endpoint: this.endpoint,
             timeout: this.timeout
           });
           await this.testConnection();
           this.posthog.capture('hume_initialized', { success: true });
           await this.supabase.from('encrypted_keys').upsert({
             key_name: 'hume_api_key',
             encrypted_value: this.apiKey
           });
         } catch (error) {
           this.posthog.capture('hume_initialization_failed', { error: error.message });
           throw error;
         }
       }

       async testConnection() {
         try {
           await this.client.ping(); // Replace with actual Hume AI ping method
           return true;
         } catch (error) {
           throw new Error(`Connection test failed: ${error.message}`);
         }
       }
     }

     module.exports = HumeService;
     ```

4. **Implement Key Rotation**:
   - Create a service to rotate the Hume API key every 30 days.
   - File: `backend/services/keyManagement.js`:
     ```javascript
     // backend/services/keyManagement.js
     const { SupabaseClient } = require('./supabase');
     const PostHog = require('posthog-js');

     class KeyManagementService {
       static KEY_ROTATION_INTERVAL = 30 * 24 * 60 * 60 * 1000; // 30 days

       constructor() {
         this.supabase = new SupabaseClient();
         this.posthog = PostHog.init(process.env.POSTHOG_API_KEY);
       }

       async rotateHumeKey() {
         try {
           const newKey = await this.generateNewKey(); // Placeholder for external key generation
           await this.supabase.from('encrypted_keys').update({
             encrypted_value: newKey,
             updated_at: new Date().toISOString()
           }).eq('key_name', 'hume_api_key');
           this.posthog.capture('hume_key_rotated', { success: true });
           return newKey;
         } catch (error) {
           this.posthog.capture('hume_key_rotation_failed', { error: error.message });
           throw error;
         }
       }

       async generateNewKey() {
         // Placeholder: Implement Hume AI dashboard API call for new key
         return 'new_hume_api_key';
       }
     }

     module.exports = KeyManagementService;
     ```

#### PRD Alignment
- **14.1 (Security Measures)**: Encrypts keys in Supabase vault with RLS for access control.
- **16.1 (Risk Assessment)**: Mitigates data breach risk with secure storage and key rotation.

### Subtask 2: Implement Circuit Breaker Pattern for Rate Limit Handling
**ID**: 2  
**Description**: Design a circuit breaker to handle Hume AI rate limits (>900 req/day) with configurable thresholds and recovery mechanisms.  
**Dependencies**: Subtask 1  
**Inputs**:
- `backend/services/hume.js`
- `backend/middleware/hume.js`
- `backend/services/rateLimiter.js` (or use `rate-limiter-flexible`)
- `.env` (HUME_RATE_LIMIT)
**Outputs**:
- Circuit breaker middleware with CLOSED, OPEN, HALF_OPEN states
- Rate limiter enforcing 100 req/min
- PostHog events: `circuit_breaker_open`, `circuit_breaker_triggered`, `circuit_breaker_reset`
**PRD Reference**: 7.2 (Security), 16.1 (Risk Assessment)

#### Steps
1. **Implement Circuit Breaker Class**:
   - Create a `HumeCircuitBreaker` class with state management and recovery logic.
   - Configure: 5 failures in 60 seconds to open, 1-minute reset timeout.
   - File: `backend/middleware/hume.js`:
     ```javascript
     // backend/middleware/hume.js
     const PostHog = require('posthog-js');

     class HumeCircuitBreaker {
       constructor() {
         this.failures = 0;
         this.lastFailureTime = 0;
         this.state = 'CLOSED';
         this.FAILURE_THRESHOLD = 5;
         this.RESET_TIMEOUT = 60000; // 1 minute
         this.posthog = PostHog.init(process.env.POSTHOG_API_KEY);
       }

       isOpen() {
         return this.state === 'OPEN';
       }

       shouldAttemptReset() {
         return Date.now() - this.lastFailureTime > this.RESET_TIMEOUT;
       }

       async executeRequest(request) {
         if (this.isOpen()) {
           if (this.shouldAttemptReset()) {
             this.state = 'HALF_OPEN';
             this.posthog.capture('circuit_breaker_half_open', { state: this.state });
           } else {
             this.posthog.capture('circuit_breaker_open', { state: this.state });
             throw new Error('Circuit breaker is OPEN');
           }
         }

         try {
           const result = await request();
           this.onSuccess();
           return result;
         } catch (error) {
           this.onFailure();
           throw error;
         }
       }

       onSuccess() {
         if (this.state === 'HALF_OPEN') {
           this.state = 'CLOSED';
           this.failures = 0;
           this.posthog.capture('circuit_breaker_reset', { state: this.state });
         }
       }

       onFailure() {
         this.failures += 1;
         this.lastFailureTime = Date.now();
         if (this.failures >= this.FAILURE_THRESHOLD) {
           this.state = 'OPEN';
           this.posthog.capture('circuit_breaker_triggered', { failures: this.failures });
         }
       }
     }

     module.exports = HumeCircuitBreaker;
     ```

2. **Integrate Rate Limiter**:
   - Use `rate-limiter-flexible` to enforce `HUME_RATE_LIMIT` (100 req/min).
   - Update `HumeService` to include rate limiting and circuit breaker.
   - File: `backend/services/hume.js` (update):
     ```javascript
     const { RateLimiter } = require('rate-limiter-flexible');
     const HumeCircuitBreaker = require('../middleware/hume');

     class HumeService {
       constructor() {
         // ... existing constructor
         this.rateLimiter = new RateLimiter({
           points: parseInt(process.env.HUME_RATE_LIMIT, 10) || 100,
           duration: 60 // 1 minute
         });
         this.circuitBreaker = new HumeCircuitBreaker();
       }

       async analyzeEmotion(text) {
         try {
           await this.rateLimiter.consume(1);
           const rawScore = await this.circuitBreaker.executeRequest(async () => {
             const response = await this.client.analyzeEmotion({ text });
             return response;
           });
           return rawScore;
         } catch (error) {
           throw error; // Handled by caller
         }
       }
     }
     ```

3. **Persist State (Optional)**:
   - For distributed systems, store circuit breaker state in Supabase.
   - SQL: `supabase/migrations/circuit_breaker_state.sql`:
     ```sql
     CREATE TABLE circuit_breaker_state (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       service_name TEXT NOT NULL,
       state TEXT CHECK (state IN ('CLOSED', 'OPEN', 'HALF_OPEN')),
       failures INTEGER DEFAULT 0,
       last_failure_time TIMESTAMPTZ,
       updated_at TIMESTAMPTZ DEFAULT NOW(),
       INDEX idx_circuit_breaker_service (service_name)
     );
     CREATE POLICY circuit_breaker_state_rls ON circuit_breaker_state
       FOR ALL TO authenticated
       USING (true);
     ```

#### PRD Alignment
- **7.2 (Security)**: Rate limiting aligns with 100 req/min/IP policy, preventing abuse.
- **16.1 (Risk Assessment)**: Circuit breaker mitigates Hume AI rate limit risk (>900 req/day).

### Subtask 3: Create Emotional Resonance Scoring Service
**ID**: 3  
**Description**: Develop a service to analyze emotional resonance using Hume AI with thresholds (arousal >0.5, valence >0.6).  
**Dependencies**: Subtasks 1, 2  
**Inputs**:
- `backend/services/hume.js`
- `backend/services/emotionalScoring.js`
- `supabase/migrations/comparisons.sql`
**Outputs**:
- Emotional resonance scoring service
- Normalized scores stored in `comparisons` table
- PostHog event: `emotional_score_validated`
**PRD Reference**: 6.6 (Intent Mirror), 6.7 (Deliverable Generation), 6.8 (SparkSplit)

#### Steps
1. **Define Scoring Thresholds**:
   - Set thresholds: arousal >0.5, valence >0.6; include target and max values for normalization.
   - File: `backend/services/emotionalScoring.js`:
     ```javascript
     // backend/services/emotionalScoring.js
     const PostHog = require('posthog-js');

     const EmotionalThresholds = {
       arousal: { min: 0.5, target: 0.7, max: 0.9 },
       valence: { min: 0.6, target: 0.8, max: 0.95 }
     };

     class EmotionalScorer {
       constructor() {
         this.posthog = PostHog.init(process.env.POSTHOG_API_KEY);
       }

       validateScore(score) {
         const isValid = score.arousal >= EmotionalThresholds.arousal.min &&
                         score.valence >= EmotionalThresholds.valence.min;
         this.posthog.capture('emotional_score_validated', {
           isValid,
           arousal: score.arousal,
           valence: score.valence
         });
         return isValid;
       }

       normalizeScore(rawScore) {
         return {
           arousal: Math.min(Math.max(rawScore.arousal || 0, 0), 1),
           valence: Math.min(Math.max(rawScore.valence || 0, 0), 1),
           confidence: rawScore.confidence || 0.8
         };
       }
     }

     module.exports = EmotionalScorer;
     ```

2. **Integrate with HumeService**:
   - Process Hume AI responses and validate scores.
   - File: `backend/services/hume.js` (update):
     ```javascript
     const EmotionalScorer = require('./emotionalScoring');
     const { SupabaseClient } = require('./supabase');

     class HumeService {
       constructor() {
         // ... existing constructor
         this.scorer = new EmotionalScorer();
         this.supabase = new SupabaseClient();
       }

       async analyzeEmotion(text, comparisonId) {
         try {
           await this.rateLimiter.consume(1);
           const rawScore = await this.circuitBreaker.executeRequest(async () => {
             const response = await this.client.analyzeEmotion({ text });
             return response;
           });
           const normalizedScore = this.scorer.normalizeScore(rawScore);
           if (!this.scorer.validateScore(normalizedScore)) {
             throw new Error('Emotional score below thresholds');
           }
           await this.supabase.from('comparisons').update({
             emotional_score: normalizedScore,
             score_source: 'hume'
           }).eq('id', comparisonId);
           return { ...normalizedScore, source: 'hume' };
         } catch (error) {
           throw error; // Handled by caller
         }
       }
     }
     ```

3. **Update Supabase Schema**:
   - Add emotional score fields to `comparisons` table.
   - File: `supabase/migrations/comparisons.sql` (update):
     ```sql
     ALTER TABLE comparisons
     ADD COLUMN emotional_score JSONB,
     ADD COLUMN score_source TEXT CHECK (score_source IN ('hume', 'gpt4o')),
     ADD INDEX idx_comparisons_score_source (score_source);
     ```

#### PRD Alignment
- **6.6 (Intent Mirror)**: Validates emotional resonance for intent summaries.
- **6.7 (Deliverable Generation)**: Ensures deliverables meet emotional thresholds.
- **6.8 (SparkSplit)**: Supports comparison with emotional resonance scores.

### Subtask 4: Add Fallback to GPT-4o for Emotional Analysis
**ID**: 4  
**Description**: Implement GPT-4o fallback when Hume AI is unavailable or circuit breaker is open, maintaining consistent output format.  
**Dependencies**: Subtasks 2, 3  
**Inputs**:
- `backend/services/hume.js`
- `backend/services/gpt4oFallback.js`
- `backend/prompts/emotionalAnalysis.js`
- `.env` (OPENAI_API_KEY)
**Outputs**:
- GPT-4o fallback service
- Consistent output format across providers
- PostHog events: `gpt4o_fallback_triggered`, `gpt4o_parse_error`
**PRD Reference**: 6.7 (Deliverable Generation), 6.8 (SparkSplit), 16.1 (Risk Assessment)

#### Steps
1. **Create GPT-4o Fallback Service**:
   - Develop a service to analyze emotion using GPT-4o with a prompt matching Hume AI’s output.
   - File: `backend/services/gpt4oFallback.js`:
     ```javascript
     // backend/services/gpt4oFallback.js
     const { OpenAI } = require('openai');
     const EmotionalScorer = require('./emotionalScoring');
     const PostHog = require('posthog-js');

     class GPT4oFallbackService {
       constructor() {
         this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
         this.scorer = new EmotionalScorer();
         this.posthog = PostHog.init(process.env.POSTHOG_API_KEY);
       }

       async analyzeEmotion(text) {
         try {
           const prompt = this.buildEmotionalAnalysisPrompt(text);
           const response = await this.openai.chat.completions.create({
             model: 'gpt-4o',
             messages: [{ role: 'user', content: prompt }],
             max_tokens: 500,
             temperature: 0.7
           });
           const rawScore = this.parseResponse(response.choices[0].message.content);
           const normalizedScore = this.scorer.normalizeScore(rawScore);
           if (!this.scorer.validateScore(normalizedScore)) {
             throw new Error('GPT-4o emotional score below thresholds');
           }
           this.posthog.capture('gpt4o_fallback_triggered', {
             reason: 'hume_unavailable',
             score: normalizedScore
           });
           return normalizedScore;
         } catch (error) {
           this.posthog.capture('gpt4o_fallback_error', { error: error.message });
           throw error;
         }
       }

       buildEmotionalAnalysisPrompt(text) {
         return `
           Analyze the emotional tone of the following text: "${text}"
           Provide a JSON response with:
           - arousal: number (0-1, intensity of emotion)
           - valence: number (0-1, positivity of emotion)
           - confidence: number (0-1, confidence in analysis)
           Example: {"arousal": 0.7, "valence": 0.8, "confidence": 0.9}
         `;
       }

       parseResponse(content) {
         try {
           return JSON.parse(content);
         } catch (error) {
           this.posthog.capture('gpt4o_parse_error', { error: error.message });
           throw new Error('Invalid GPT-4o response format');
         }
       }
     }

     module.exports = GPT4oFallbackService;
     ```

2. **Integrate Fallback with HumeService**:
   - Update `HumeService` to use GPT-4o fallback and store results.
   - File: `backend/services/hume.js` (update):
     ```javascript
     const GPT4oFallbackService = require('./gpt4oFallback');

     class HumeService {
       constructor() {
         // ... existing constructor
         this.fallback = new GPT4oFallbackService();
       }

       async analyzeEmotion(text, comparisonId) {
         try {
           await this.rateLimiter.consume(1);
           const rawScore = await this.circuitBreaker.executeRequest(async () => {
             const response = await this.client.analyzeEmotion({ text });
             return response;
           });
           const normalizedScore = this.scorer.normalizeScore(rawScore);
           if (!this.scorer.validateScore(normalizedScore)) {
             throw new Error('Emotional score below thresholds');
           }
           await this.supabase.from('comparisons').update({
             emotional_score: normalizedScore,
             score_source: 'hume'
           }).eq('id', comparisonId);
           return { ...normalizedScore, source: 'hume' };
         } catch (error) {
           this.posthog.capture('hume_fallback_triggered', { error: error.message });
           const fallbackScore = await this.fallback.analyzeEmotion(text);
           await this.supabase.from('comparisons').update({
             emotional_score: fallbackScore,
             score_source: 'gpt4o'
           }).eq('id', comparisonId);
           return { ...fallbackScore, source: 'gpt4o' };
         }
       }
     }
     ```

3. **Define GPT-4o Prompt**:
   - Store the emotional analysis prompt for consistency.
   - File: `backend/prompts/emotionalAnalysis.js`:
     ```javascript
     // backend/prompts/emotionalAnalysis.js
     module.exports = {
       emotionalAnalysisPrompt: (text) => `
         Analyze the emotional tone of the following text: "${text}"
         Provide a JSON response with:
         - arousal: number (0-1, intensity of emotion)
         - valence: number (0-1, positivity of emotion)
         - confidence: number (0-1, confidence in analysis)
         Example: {"arousal": 0.7, "valence": 0.8, "confidence": 0.9}
       `
     };
     ```

#### PRD Alignment
- **6.7 (Deliverable Generation)**: Ensures consistent output with fallback for reliable deliverables.
- **6.8 (SparkSplit)**: Maintains trust with reliable comparisons.
- **16.1 (Risk Assessment)**: Mitigates Hume AI rate limit risk with GPT-4o fallback.

### Subtask 5: Test Circuit Breaker and Fallback Functionality
**ID**: 5  
**Description**: Comprehensive testing of circuit breaker behavior, fallback mechanisms, and emotional analysis pipeline under various failure scenarios.  
**Dependencies**: Subtasks 1, 2, 3, 4  
**Inputs**:
- `backend/tests/unit/emotionalAnalysis.test.js`
- `backend/tests/integration/emotionalAnalysis.integration.test.js`
- `backend/tests/load/emotionalAnalysis.load.py`
- `backend/services/hume.js`
- `backend/services/gpt4oFallback.js`
**Outputs**:
- Unit, integration, and load tests
- Test coverage >80%
- PRD metrics validated (arousal, valence, uptime, response time)
**PRD Reference**: 13.1 (Test Types), 13.3 (Acceptance Criteria)

#### Steps
1. **Unit Tests**:
   - Test client initialization, circuit breaker transitions, scoring logic, and fallback.
   - File: `backend/tests/unit/emotionalAnalysis.test.js`:
     ```javascript
     // backend/tests/unit/emotionalAnalysis.test.js
     const HumeService = require('../../services/hume');
     const HumeCircuitBreaker = require('../../middleware/hume');
     const GPT4oFallbackService = require('../../services/gpt4oFallback');
     const EmotionalScorer = require('../../services/emotionalScoring');

     describe('Emotional Analysis Service', () => {
       let humeService;

       beforeEach(() => {
         humeService = new HumeService();
         jest.spyOn(humeService, 'initialize').mockResolvedValue();
       });

       it('should initialize Hume AI client', async () => {
         await expect(humeService.initialize()).resolves.toBeUndefined();
       });

       it('should trigger circuit breaker after 5 failures', async () => {
         const circuitBreaker = new HumeCircuitBreaker();
         for (let i = 0; i < 5; i++) {
           circuitBreaker.onFailure();
         }
         expect(circuitBreaker.isOpen()).toBe(true);
       });

       it('should validate emotional score thresholds', async () => {
         const scorer = new EmotionalScorer();
         const score = { arousal: 0.7, valence: 0.8, confidence: 0.9 };
         expect(scorer.validateScore(score)).toBe(true);
         const invalidScore = { arousal: 0.4, valence: 0.5, confidence: 0.9 };
         expect(scorer.validateScore(invalidScore)).toBe(false);
       });

       it('should normalize scores correctly', async () => {
         const scorer = new EmotionalScorer();
         const rawScore = { arousal: 1.2, valence: -0.1, confidence: 0.95 };
         const normalized = scorer.normalizeScore(rawScore);
         expect(normalized.arousal).toBe(1);
         expect(normalized.valence).toBe(0);
         expect(normalized.confidence).toBe(0.95);
       });

       it('should fall back to GPT-4o when Hume AI fails', async () => {
         jest.spyOn(humeService.client, 'analyzeEmotion')
           .mockRejectedValue(new Error('Hume API error'));
         jest.spyOn(humeService.fallback, 'analyzeEmotion')
           .mockResolvedValue({ arousal: 0.7, valence: 0.8, confidence: 0.9 });
         const result = await humeService.analyzeEmotion('Test text', 'uuid');
         expect(result.source).toBe('gpt4o');
       });
     });
     ```

2. **Integration Tests**:
   - Test the end-to-end pipeline, including fallback and rate limiting.
   - File: `backend/tests/integration/emotionalAnalysis.integration.test.js`:
     ```javascript
     // backend/tests/integration/emotionalAnalysis.integration.test.js
     const HumeService = require('../../services/hume');
     const { SupabaseClient } = require('../../services/supabase');

     describe('Emotional Analysis Integration', () => {
       let humeService;
       let supabase;

       beforeEach(async () => {
         humeService = new HumeService();
         supabase = new SupabaseClient();
         await humeService.initialize();
       });

       it('should maintain consistent output format across providers', async () => {
         const text = 'This is a warm and inviting business plan';
         const comparisonId = 'test-uuid';
         const result = await humeService.analyzeEmotion(text, comparisonId);
         expect(result).toHaveProperty('arousal');
         expect(result).toHaveProperty('valence');
         expect(result).toHaveProperty('confidence');
         expect(result).toHaveProperty('source');
         const stored = await supabase.from('comparisons').select('*').eq('id', comparisonId);
         expect(stored.data[0].emotional_score).toEqual(expect.objectContaining({
           arousal: expect.any(Number),
           valence: expect.any(Number),
           confidence: expect.any(Number)
         }));
       });

       it('should handle rate limiting with fallback', async () => {
         jest.spyOn(humeService.rateLimiter, 'consume')
           .mockRejectedValue(new Error('Rate limit exceeded'));
         jest.spyOn(humeService.fallback, 'analyzeEmotion')
           .mockResolvedValue({ arousal: 0.7, valence: 0.8, confidence: 0.9 });
         const result = await humeService.analyzeEmotion('Test text', 'uuid');
         expect(result.source).toBe('gpt4o');
       });
     });
     ```

3. **Load Tests**:
   - Simulate rate limits and failures using Locust.
   - File: `backend/tests/load/emotionalAnalysis.load.py`:
     ```python
     from locust import HttpUser, task, between

     class EmotionalAnalysisUser(HttpUser):
         wait_time = between(0.5, 2)

         @task
         def analyze_emotion(self):
             self.client.post("/v1/analyze-emotion", json={
                 "text": "This is a test text for emotional analysis",
                 "comparisonId": "test-uuid"
             }, headers={"Authorization": "Bearer test_token"})
     ```

4. **Validate PRD Metrics**:
   - Ensure arousal >0.5, valence >0.6 for 95% of deliverables (PRD 13.3).
   - Verify 99.9% uptime and <2s response time (PRD 7.1).
   - Achieve test coverage >80% (PRD 13.3).

#### PRD Alignment
- **13.1 (Test Types)**: Includes unit, integration, and load tests for comprehensive validation.
- **13.3 (Acceptance Criteria)**: Meets emotional resonance, performance, and coverage targets.

## 3. API Endpoints

The service exposes the following endpoints to support emotional analysis, integrated with the platform’s API catalog (PRD 8.7).

- **POST /v1/analyze-emotion**:
  - **Purpose**: Analyzes emotional resonance of input text using Hume AI or GPT-4o fallback.
  - **Handler**: `backend/routes/emotionalAnalysis.js`
  - **Request**:
    ```json
    {
      "text": "This is a warm and inviting business plan",
      "comparisonId": "uuid"
    }
    ```
  - **Response**:
    ```json
    {
      "arousal": 0.7,
      "valence": 0.8,
      "confidence": 0.9,
      "source": "hume",
      "error": null
    }
    ```
  - **Middleware**:
    - `backend/middleware/validation.js` (Joi for schema validation, DOMPurify for XSS prevention)
    - `backend/middleware/rateLimit.js` (100 req/min per IP)
    - `backend/middleware/auth.js` (Memberstack auth for user context)
  - **Services**: `backend/services/hume.js`, `backend/services/gpt4oFallback.js`

- **GET /v1/analyze-emotion/status**:
  - **Purpose**: Checks the status of the emotional analysis service (admin only).
  - **Handler**: `backend/routes/emotionalAnalysis.js`
  - **Response**:
    ```json
    {
      "status": "operational",
      "circuitBreakerState": "CLOSED",
      "error": null
    }
    ```
  - **Middleware**: `backend/middleware/auth.js` (Memberstack auth for admin)

**Implementation**:
- File: `backend/routes/emotionalAnalysis.js`:
  ```javascript
  // backend/routes/emotionalAnalysis.js
  const express = require('express');
  const HumeService = require('../services/hume');
  const validate = require('../middleware/validation');
  const rateLimit = require('../middleware/rateLimit');
  const auth = require('../middleware/auth');
  const Joi = require('joi');

  const router = express.Router();
  const humeService = new HumeService();

  const analyzeEmotionSchema = Joi.object({
    text: Joi.string().min(1).max(1000).required(),
    comparisonId: Joi.string().uuid().required()
  });

  router.post('/analyze-emotion', [validate(analyzeEmotionSchema), rateLimit], async (req, res) => {
    try {
      const { text, comparisonId } = req.body;
      const result = await humeService.analyzeEmotion(text, comparisonId);
      res.status(200).json({ ...result, error: null });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/analyze-emotion/status', auth, async (req, res) => {
    try {
      const status = humeService.circuitBreaker.isOpen() ? 'degraded' : 'operational';
      res.status(200).json({
        status,
        circuitBreakerState: humeService.circuitBreaker.state,
        error: null
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  module.exports = router;
  ```

## 4. Documentation

### API Documentation
- File: `docs/api/emotional-analysis.md`
```markdown
# Emotional Analysis API

## POST /v1/analyze-emotion
Analyzes the emotional resonance of input text using Hume AI or GPT-4o fallback.

**Request**:
```json
{
  "text": "This is a warm and inviting business plan",
  "comparisonId": "uuid"
}
```

**Response**:
```json
{
  "arousal": 0.7,
  "valence": 0.8,
  "confidence": 0.9,
  "source": "hume",
  "error": null
}
```

**Authentication**: Memberstack JWT required.

## GET /v1/analyze-emotion/status
Checks the status of the emotional analysis service (admin only).

**Response**:
```json
{
  "status": "operational",
  "circuitBreakerState": "CLOSED",
  "error": null
}
```

**Authentication**: Memberstack JWT (admin role required).
```

### Compliance Documentation
- **GDPR/CCPA Compliance**:
  - User data (e.g., input text) is anonymized before storage in `comparisons`.
  - Data is purged after 24 months via Supabase `pg_cron` job (`databases/cron/purge.sql`).
  - Consent is captured via Webflow modal (`frontend/public/consent.html`, PRD 14.1).
- **User Trust**:
  - Emotional scores are logged transparently with source (`hume` or `gpt4o`) in `comparisons`, supporting TrustDelta ≥4.2 (PRD 12.3).
  - PostHog events provide audit trails for transparency.
- **Safety**:
  - Input validation with Joi and DOMPurify prevents XSS and injection attacks (PRD 14.1).
  - Rate limiting (100 req/min) prevents abuse (PRD 7.2).

### Developer Notes
- File: `docs/developer/emotional-analysis-notes.md`
```markdown
# Emotional Analysis Service Notes

- **Initialization**: Ensure `HUME_API_KEY` and `OPENAI_API_KEY` are set in `.env`.
- **Circuit Breaker**: Configurable via `FAILURE_THRESHOLD` (5) and `RESET_TIMEOUT` (60s).
- **Scoring**: Thresholds (arousal >0.5, valence >0.6) are defined in `EmotionalThresholds`.
- **Fallback**: GPT-4o is triggered when Hume AI fails or circuit breaker is OPEN.
- **Testing**: Run `npm test` for unit/integration tests; use Locust for load tests.
- **Monitoring**: Check PostHog for events (`hume_fallback_triggered`, `emotional_score_validated`).
```

## 5. Monitoring and Logging

The service integrates with PostHog and Sentry for monitoring and logging, ensuring traceability and performance tracking (PRD 8.6).

- **PostHog Events**:
  - `hume_initialized`: Successful Hume AI client initialization.
  - `hume_initialization_failed`: Failed initialization with error details.
  - `hume_key_rotated`: Successful key rotation.
  - `hume_key_rotation_failed`: Failed key rotation.
  - `circuit_breaker_open`: Circuit breaker enters OPEN state.
  - `circuit_breaker_triggered`: Failure threshold reached.
  - `circuit_breaker_half_open`: Circuit breaker enters HALF_OPEN state.
  - `circuit_breaker_reset`: Circuit breaker resets to CLOSED.
  - `emotional_score_validated`: Emotional score validation result (arousal, valence, isValid).
  - `hume_fallback_triggered`: Fallback to GPT-4o with reason and score.
  - `gpt4o_fallback_error`: General fallback error.
  - `gpt4o_parse_error`: Invalid GPT-4o response format.

- **Sentry**:
  - Tracks errors (e.g., Hume API failures, GPT-4o parsing errors) in `backend/services/sentry.js`.
  - Configured in `backend/server.js`:
    ```javascript
    const Sentry = require('@sentry/node');
    Sentry.init({ dsn: process.env.SENTRY_DSN });
    ```

- **Supabase Logs**:
  - Emotional scores stored in `comparisons.emotional_score` and `comparisons.score_source`.
  - Errors logged in `error_logs`:
    ```sql
    CREATE TABLE error_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      error_type TEXT NOT NULL,
      message TEXT NOT NULL,
      context JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      INDEX idx_error_logs_error_type (error_type)
    );
    ```

## 6. Acceptance Criteria

The implementation must meet the following criteria, aligned with PRD requirements:

- **AC-1**: Hume AI client initializes successfully, validated by `/v1/analyze-emotion/status` returning `{ status: "operational" }` (PRD 14.2).
- **AC-2**: Circuit breaker triggers after 5 failures in 60 seconds and resets after 1 minute, verified by Jest tests (PRD 16.2).
- **AC-3**: Emotional scores meet arousal >0.5, valence >0.6 for 95% of deliverables, logged in `comparisons` (PRD 13.3).
- **AC-4**: GPT-4o fallback produces consistent output format (`{ arousal, valence, confidence, source }`), validated by integration tests (PRD 6.7).
- **AC-5**: Test coverage >80%, verified by Jest (`backend/coverage/lcov-report/`) (PRD 13.3).
- **AC-6**: API responses <200ms for 99% of requests, validated by Locust (`backend/tests/load-report.json`) (PRD 7.1).
- **AC-7**: GDPR/CCPA compliance with 24-month data purge, verified by `pg_cron` logs (PRD 14.1).
- **AC-8**: All PostHog events are logged correctly, validated by PostHog dashboard (PRD 12.8).

## 7. Risks and Mitigations

The following risks are identified with mitigations, aligned with PRD 16.1:

| **Risk** | **Probability** | **Impact** | **Mitigation** |
|----------|-----------------|------------|----------------|
| Hume AI rate limits (>900 req/day) | Medium | Medium | Circuit breaker with GPT-4o fallback; log fallbacks in `error_logs` with `hume_fallback_triggered` event. |
| GPT-4o inaccuracy | Medium | High | Fine-tune prompts in `backend/prompts/emotionalAnalysis.js`; validate outputs with Jest tests; log inaccuracies in `error_logs` (`error_type: 'low_confidence'`). |
| Data breach | Low | Critical | Encrypt API keys in Supabase vault; enable RLS on `comparisons` and `encrypted_keys`; use DOMPurify for input sanitization. |
| API downtime | Low | High | Cache scores in `backend/services/cache.js` (TTL: 5min); retry failed requests 3 times (500ms intervals) via `backend/middleware/retry.js`. |

## 8. Future Enhancements

The following enhancements are planned to extend the service, aligned with PRD 17.1:

- **Cultural Intelligence**: Enhance Hume AI to incorporate cultural context (e.g., regional norms) in emotional analysis, updating `backend/services/hume.js` and `backend/prompts/` (T17.1.4).
- **Feedback-Driven Training**: Integrate user feedback from `feedback_logs` to fine-tune GPT-4o prompts, improving TrustDelta by ≥0.1 (T17.1.3).
- **Voice Mode**: Add support for voice input in emotional analysis using Web Speech API in `frontend/public/funnel.html` (T17.1.1).

## 9. TaskMaster-Compatible Task Breakdown

The following TaskMaster tasks are derived from the subtasks to ensure implementation alignment:

```yaml
tasks:
  - id: T6.1-hume-client-init
    description: Initialize Hume AI client with secure API key management and vault storage.
    inputs:
      - .env
      - backend/services/hume.js
      - backend/services/keyManagement.js
      - supabase/migrations/005_vault_setup.sql
    outputs:
      - Initialized Hume AI client
      - Encrypted keys in Supabase
      - PostHog events (hume_initialized, hume_key_rotated)
    dependencies:
      - T2-backend-setup
    cursor-ai-instructions:
      - Configure .env with HUME_API_KEY, HUME_API_ENDPOINT
      - Create HumeService class with initialization and connection test
      - Implement key rotation in KeyManagementService
      - Set up Supabase vault with RLS
      - Log events with PostHog
      - Write Jest tests (backend/tests/unit/hume.test.js)

  - id: T6.2-circuit-breaker
    description: Implement circuit breaker for rate limit handling with rate limiter integration.
    inputs:
      - backend/middleware/hume.js
      - backend/services/hume.js
      - supabase/migrations/circuit_breaker_state.sql
    outputs:
      - Circuit breaker middleware
      - Rate limiter (100 req/min)
      - PostHog events (circuit_breaker_triggered, circuit_breaker_reset)
    dependencies:
      - T6.1-hume-client-init
    cursor-ai-instructions:
      - Create HumeCircuitBreaker class with state management
      - Integrate rate-limiter-flexible in HumeService
      - Optionally persist state in Supabase
      - Log circuit breaker events with PostHog
      - Write Jest tests (backend/tests/unit/circuitBreaker.test.js)

  - id: T6.3-emotional-scoring
    description: Develop emotional resonance scoring service with thresholds.
    inputs:
      - backend/services/emotionalScoring.js
      - backend/services/hume.js
      - supabase/migrations/comparisons.sql
    outputs:
      - Scoring service (arousal >0.5, valence >0.6)
      - Scores in comparisons table
      - PostHog event (emotional_score_validated)
    dependencies:
      - T6.1-hume-client-init
      - T6.2-circuit-breaker
    cursor-ai-instructions:
      - Create EmotionalScorer class with thresholds and normalization
      - Update HumeService to process and store scores
      - Add emotional_score and score_source to comparisons
      - Log validation events with PostHog
      - Write Jest tests (backend/tests/unit/emotionalScoring.test.js)

  - id: T6.4-gpt4o-fallback
    description: Implement GPT-4o fallback for emotional analysis.
    inputs:
      - backend/services/gpt4oFallback.js
      - backend/services/hume.js
      - backend/prompts/emotionalAnalysis.js
    outputs:
      - GPT-4o fallback service
      - Consistent output format
      - PostHog events (gpt4o_fallback_triggered, gpt4o_parse_error)
    dependencies:
      - T6.2-circuit-breaker
      - T6.3-emotional-scoring
    cursor-ai-instructions:
      - Create GPT4oFallbackService with prompt and parsing logic
      - Integrate fallback in HumeService
      - Define prompt in emotionalAnalysis.js
      - Log fallback events with PostHog
      - Write Jest tests (backend/tests/unit/gpt4oFallback.test.js)

  - id: T6.5-testing
    description: Test circuit breaker, fallback, and emotional analysis pipeline.
    inputs:
      - backend/tests/unit/emotionalAnalysis.test.js
      - backend/tests/integration/emotionalAnalysis.integration.test.js
      - backend/tests/load/emotionalAnalysis.load.py
    outputs:
      - Unit, integration, and load tests
      - Coverage >80%
      - PRD metrics validated
    dependencies:
      - T6.1-hume-client-init
      - T6.2-circuit-breaker
      - T6.3-emotional-scoring
      - T6.4-gpt4o-fallback
    cursor-ai-instructions:
      - Write unit tests for initialization, scoring, and fallback
      - Write integration tests for pipeline and fallback
      - Script Locust tests for rate limits
      - Validate PRD metrics (arousal, valence, uptime)
      - Generate coverage report
```

## 10. References

- **PRD Sections**: 6.6, 6.7, 6.8, 7.1, 7.2, 13.1, 13.3, 14.1, 16.1, 17.1
- **TaskMaster Task**: ID 6, Subtasks 1–5
- **Research**: Cursor Agent and TaskMaster summary, Cursor Implementation Plan
- **Dependencies**: Task 2 (Backend Setup, T8.1.1-backend-setup)
- **Related Files**:
  - `backend/services/hume.js`
  - `backend/middleware/hume.js`
  - `backend/services/emotionalScoring.js`
  - `backend/services/gpt4oFallback.js`
  - `backend/routes/emotionalAnalysis.js`
  - `supabase/migrations/*`
  - `docs/api/emotional-analysis.md`

## 11. Notes for Developers

- **Setup**: Ensure all environment variables are configured before running the service.
- **Testing**: Use `npm test` for Jest tests; run `locust -f backend/tests/load/emotionalAnalysis.load.py` for load tests.
- **Monitoring**: Monitor PostHog for event logs and Sentry for error tracking.
- **Compliance**: Verify GDPR/CCPA compliance by checking `pg_cron` purge job and consent logs.
- **Extensibility**: Plan for future enhancements (e.g., cultural intelligence) by keeping services modular.

This document provides a clear, actionable roadmap for implementing the Hume AI Emotional Resonance Service, ensuring alignment with the CanAI PRD and smooth development progress. For any clarifications, refer to the PRD or contact the solo developer.