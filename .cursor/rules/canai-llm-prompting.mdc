---
description: 
globs: 
alwaysApply: true
---
# CanAI LLM Prompting Rules

## Purpose
Standardize GPT-4o prompts for the **CanAI Emotional Sovereignty Platform** to deliver accurate, emotionally resonant outputs with >0.7 resonance, TrustDelta ≥4.2, and alignment with the 9-stage user journey (F1-F9).

## Standards

### Prompt Structure and Organization
- **Structured Prompts**: Define all prompts in `backend/prompts/` with clear file organization:
  - `backend/prompts/funnel.js` - F2: Discovery Funnel validation and trust scoring
  - `backend/prompts/sparks.js` - F3: Spark Layer generation and regeneration
  - `backend/prompts/inputs.js` - F5: Detailed Input Collection tooltips and guidance
  - `backend/prompts/intent.js` - F6: Intent Mirror summary and confidence scoring
  - `backend/prompts/deliverables.js` - F7: Deliverable Generation with product-specific outputs
  - `backend/prompts/sparkSplit.js` - F8: SparkSplit comparison and TrustDelta calculation
  - `backend/prompts/feedback.js` - F9: Feedback sentiment analysis
  - `backend/prompts/contradiction.js` - Cross-stage contradiction detection
  - `backend/prompts/tooltip.js` - Dynamic tooltip generation
  - `backend/prompts/trustDelta.js` - Cultural specificity and quality scoring

### Emotional Driver Integration
- **Driver Mapping**: Incorporate emotional drivers from user inputs into all prompts:
  - **Community**: From `businessDescription` containing community-focused keywords
  - **Trust**: From `brandVoice` values like "warm", "authentic", "reliable"
  - **Ambition**: From `primaryGoal` related to growth, funding, expansion
  - **Connection**: From `targetAudience` emphasizing relationships, local focus
  - **Inclusion**: From `uniqueValue` highlighting accessibility, diversity, welcoming
- **Prompt Integration**: Every prompt must include emotional driver inference:
  ```javascript
  // Example pattern for backend/prompts/deliverables.js
  "Infer emotional driver from inputs: {businessDescription}, {brandVoice}, {primaryGoal}, {targetAudience}, {uniqueValue}. 
  Prioritize community, trust, ambition, connection, inclusion. 
  Generate output emphasizing the inferred driver throughout the content."
  ```

### Tone Implementation and Validation
- **Tone Templates**: Implement structured tone patterns aligned with user preferences:
  - **warm**: "Your vision weaves community connections that nurture growth..."
  - **bold**: "Your empire reshapes markets with decisive innovation..."
  - **optimistic**: "Your dream ignites progress and brightens futures..."
  - **professional**: "Your strategy secures success through proven methodologies..."
  - **playful**: "Your spark dances with joy and creative energy..."
  - **inspirational**: "Your vision soars to new heights of possibility..."
  - **custom**: User-defined tone with validation for appropriateness
- **Tone Consistency**: Ensure tone alignment across all generated content within a user session
- **Tone Validation**: Use Hume AI to validate tone effectiveness (arousal >0.5, valence >0.6)

### Mandatory Prompt Endings
- **Standard Closure**: Every prompt must end with the exact phrase:
  ```
  "Review output for consistency with task goal, avoid filler, and list assumptions made."
  ```
- **Anti-Pattern Prevention**: Explicitly prohibit placeholder phrases:
  - Never include: "As an AI language model...", "I understand that...", "Please note that..."
  - Focus on direct, actionable content generation

### Input Validation and Guardrails
- **Required Fields**: Ensure prompts include validation for mandatory inputs:
  - `businessType` - Core business category for context
  - `primaryChallenge` - Key problem to address
  - `preferredTone` - Communication style preference
- **Content Filtering**: Integrate NSFW and inappropriate content filtering:
  - Use `/v1/filter-input` endpoint before prompt processing
  - Implement contradiction detection via `backend/prompts/contradiction.js`
  - Flag tone/goal mismatches (e.g., "bold" tone with "improve operations" goal)
- **External Data Exclusion**: Prohibit prompts from referencing external data sources not provided in user inputs

### Token Management and Optimization
- **Token Limits**: Enforce 128K token maximum per GPT-4o request
- **MapReduce Implementation**: Use chunking strategy in `backend/services/gpt4o.js` for large inputs:
  - Prioritize critical fields: `businessDescription`, `primaryGoal`, `targetAudience`
  - Implement progressive summarization for overflow scenarios
  - Cache truncated inputs with TTL for retry scenarios
- **Token Monitoring**: Track token usage per prompt and implement alerts at 80% capacity

### Emotional Resonance Requirements
- **Hume AI Integration**: Validate all outputs for emotional resonance:
  - **Minimum Thresholds**: Valence >0.6, Arousal >0.5
  - **Weighted Scoring**: 0.6 valence weight, 0.4 arousal weight for overall score
  - **Fallback Strategy**: Circuit breaker at >900 Hume AI requests/day, fallback to GPT-4o sentiment
- **Resonance Validation**: Implement automatic rewrite triggers for outputs below thresholds
- **Cultural Context**: Enhance prompts with location-specific context (e.g., Denver's LoHi culture)

### Model Management and Fallback
- **Primary Model**: Default to GPT-4o for all prompt processing
- **Fallback Strategy**: Switch to GPT-4o-mini on rate limits or API failures
- **Fallback Notification**: Log fallback events to PostHog with reason codes
- **Quality Maintenance**: Ensure fallback outputs meet minimum quality standards

### Prompt Validation and Testing
- **Endpoint Validation**: Ensure prompt completeness for critical endpoints:
  - `/v1/generate-sparks`: Include `businessType`, `tone`, `outcome`, emotional driver
  - `/v1/intent-mirror`: Generate 15-25 word summary with confidence score (0.0-1.0)
  - `/v1/request-revision`: Incorporate user feedback and maintain consistency
- **Output Specifications**:
  - **Business Plan Builder**: 700-800 words with investor focus
  - **Social Media Campaign**: 3-7 posts + 3-5 emails with engagement optimization
  - **Website Audit**: 300-400 words with actionable recommendations
- **Quality Metrics**: Validate TrustDelta ≥4.2 for all comparative outputs

### Prompt Versioning and A/B Testing
- **Version Control**: Implement formal prompt versioning system:
  - Directory structure: `backend/prompts/v1/`, `backend/prompts/v2/`, etc.
  - Semantic versioning for prompt changes (1.0.0, 1.1.0, 2.0.0)
  - Change logs documenting prompt modifications and performance impact
- **Feature Flag Integration**: Use feature flags for A/B testing prompt variations:
  - Test tone effectiveness across user segments
  - Validate emotional driver impact on user satisfaction
  - Measure TrustDelta improvements with prompt optimizations
- **Performance Tracking**: Monitor prompt performance metrics for continuous improvement

### Content Traceability and Validation
- **Source Traceability**: Ensure all AI-generated content traces to specific user inputs:
  - Maintain input-output mapping in `databases/prompt_logs`
  - Document content generation decision points
  - Provide audit trail for content generation processes
- **Knowledge Base Validation**: Verify prompts only reference vetted internal knowledge:
  - Prohibit external data integration without validation
  - Maintain approved knowledge base for business context
  - Regular validation of prompt accuracy against known business domains

## Validation and Automation

### CI/CD Integration
- **Prompt Syntax Validation**: Automated checks via `.github/workflows/prompts.yml`:
  - Validate JavaScript syntax in prompt files
  - Check for required emotional driver integration
  - Verify mandatory prompt ending compliance
  - Test token count estimations
- **Performance Testing**: Automated prompt performance validation:
  - Response time testing (<2s for deliverable generation)
  - Token usage monitoring and optimization
  - Emotional resonance threshold validation

### Testing Requirements
- **Unit Testing**: Comprehensive prompt testing in `backend/tests/prompts.test.js`:
  - Test prompt output quality and consistency
  - Validate emotional driver inference accuracy
  - Check token usage optimization
  - Verify sentiment and emotional resonance thresholds
- **Integration Testing**: End-to-end prompt validation:
  - Test prompt chains across user journey stages
  - Validate cross-stage consistency and coherence
  - Ensure proper error handling and fallback behavior

### Monitoring and Analytics
- **PostHog Tracking**: Monitor prompt performance and user satisfaction:
  - `prompt_success` - Successful prompt completion with metrics
  - `prompt_failed` - Prompt failures with error categorization
  - `intent_mirror_confidence` - Confidence scores for summary generation
  - `emotional_resonance_achieved` - Resonance threshold compliance
  - `trust_delta_generated` - TrustDelta scores for quality comparison
- **Sentry Integration**: Error tracking and performance monitoring:
  - `prompt_failure` - Technical failures with stack traces
  - Performance degradation alerts for prompt processing
  - Token limit exceeded notifications

### Performance Optimization
- **Caching Strategy**: Implement intelligent prompt result caching:
  - Cache frequent prompt patterns with TTL optimization
  - User-specific caching for iterative improvements
  - Performance-critical endpoint caching (sparks, deliverables)
- **Latency Targets**: Meet strict performance requirements:
  - Spark generation: <1.5s
  - Intent mirror: <1s  
  - Deliverable generation: <2s
  - Feedback processing: <500ms

## References and Alignment

### PRD Sections
- **Section 6.2**: 2-Step Discovery Funnel validation and trust scoring
- **Section 6.3**: Spark Layer generation with tone and emotional drivers
- **Section 8.4**: AI Integration with GPT-4o and Hume AI specifications
- **Section 16**: Risk Assessment for prompt quality and user safety
- **Section 17**: Future Enhancements including cultural intelligence

### Project Structure
- **Backend Prompts**: `backend/prompts/` - All structured prompt files
- **GPT-4o Service**: `backend/services/gpt4o.js` - Core AI integration with token management
- **Hume AI Service**: `backend/services/hume.js` - Emotional resonance validation
- **API Routes**: `backend/routes/` - Prompt-driven endpoint implementations
- **Testing**: `backend/tests/prompts.test.js` - Comprehensive prompt validation

### Emotional Driver Reference
- **Community**: Focus on connection, local impact, relationships
- **Trust**: Emphasize reliability, authenticity, transparency  
- **Ambition**: Highlight growth, achievement, success
- **Connection**: Stress relationships, networking, collaboration
- **Inclusion**: Promote accessibility, diversity, welcoming environments

## Technical Implementation

### Development Standards
- **Code Organization**: Maintain clear separation between prompt logic and business logic
- **Documentation**: JSDoc all prompt functions with examples and expected outputs
- **Error Handling**: Comprehensive error handling with user-friendly fallbacks
- **Security**: Input sanitization and validation for all prompt processing

### Quality Assurance
- **Peer Review**: All prompt modifications require senior developer review
- **A/B Testing**: Validate prompt improvements through controlled testing
- **User Feedback**: Incorporate user satisfaction data into prompt optimization
- **Performance Monitoring**: Continuous monitoring of prompt effectiveness and efficiency

---

## Technical Notes
- **Applies to**: All backend prompt processing including `backend/prompts/`, `backend/services/gpt4o.js`, `backend/services/hume.js`
- **Technology Stack**: GPT-4o, Hume AI, Node.js, Express.js, Supabase integration
- **Performance Targets**: >0.7 emotional resonance, ≥4.2 TrustDelta, <2s generation time, 128K token limit
- **Quality Standards**: Emotional driver integration, tone consistency, cultural specificity, content traceability
- **Updated**: Comprehensive prompting standards aligned with 9-stage user journey and emotional sovereignty goals
- **Version**: 2.0.0 - Complete prompting infrastructure for CanAI platform




