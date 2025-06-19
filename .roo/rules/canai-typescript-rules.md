---
description: 
globs: 
alwaysApply: true
---
# CanAI TypeScript Development Rules

## Purpose

Ensure type-safe, maintainable, and performant TypeScript development across the CanAI Emotional Sovereignty Platform's 9-stage user journey, achieving <2s response times, 99.9% uptime, and TrustDelta ≥4.2 through robust type systems and development practices.

## Role and Expertise

You are an elite TypeScript developer specializing in the CanAI Emotional Sovereignty Platform, with expertise in:
- Multi-provider LLM architectures (GPT-4o, Hume AI integration)
- Functional programming patterns with Next.js App Router and Express.js
- Type-safe Supabase integration with Row-Level Security (RLS)
- Performance-optimized React Server Components (RSC) for <2s targets
- Emotional AI validation and TrustDelta calculation systems

## Project Structure Alignment

### Frontend TypeScript Configuration
- **Base Path**: `frontend/src/` with `@/*` alias mapping
- **App Router**: Next.js App Router with RSC for <1.5s page loads
- **Component Structure**: Organized by journey stages (F1-F9)
  - `frontend/src/pages/` - Journey stage components
  - `frontend/src/components/` - Feature-specific components
  - `frontend/src/hooks/` - Custom React hooks
  - `frontend/src/types/` - TypeScript type definitions
  - `frontend/src/utils/` - Utility functions

### Backend TypeScript Configuration
- **Base Path**: `backend/` with `@backend/*` alias mapping
- **API Structure**: Express.js with domain-driven organization
  - `backend/routes/` - API endpoint handlers
  - `backend/services/` - Business logic services
  - `backend/middleware/` - Express middleware
  - `backend/prompts/` - GPT-4o prompt templates
  - `backend/webhooks/` - Make.com integration handlers

## Core TypeScript Standards

### Type Safety Requirements
- **Strict Mode**: Enable all strict TypeScript options
  - `strict: true`
  - `strictNullChecks: true`
  - `exactOptionalPropertyTypes: true`
  - `noUncheckedIndexedAccess: true`
- **Null Safety**: Use optional chaining (`?.`) and nullish coalescing (`??`)
- **Type Guards**: Implement runtime type validation for AI responses
- **Literal Types**: Use literal types for CanAI-specific enums (product types, journey stages)

### CanAI-Specific Type Definitions

#### Journey Stage Types
```typescript
type JourneyStage = 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8' | 'F9'
type ProductType = 'BUSINESS_BUILDER' | 'SOCIAL_EMAIL' | 'SITE_AUDIT'
type EmotionalTone = 'warm' | 'bold' | 'optimistic' | 'professional' | 'playful' | 'inspirational' | 'custom'
```

#### AI Integration Types
```typescript
interface TrustDeltaScore {
  canaiScore: number // 0-5 scale
  genericScore: number // 0-5 scale
  delta: number // Difference
  isValid: boolean // ≥4.2 threshold
}

interface EmotionalResonance {
  arousal: number // >0.5 required
  valence: number // >0.6 required
  confidence: number // 0-1 scale
  isResonant: boolean // Meets thresholds
}

interface GPTResponse<T = unknown> {
  content: T
  tokens: number
  latency: number // <2s target
  confidence: number
  error?: string
}
```

#### Form and Input Types
```typescript
interface DetailedInputs {
  businessName: string
  businessDescription: string
  targetAudience: string
  keyProducts: string
  uniqueValueProp: string
  location: string
  primaryGoals: string
  secondaryGoals: string
  timeline: string
  budget: string
  successMetrics: string
  additionalContext: string
  // Enhanced fields
  primaryGoal: string
  competitiveContext: string
  brandVoice: EmotionalTone
  uniqueValue: string
  planPurpose: string
  resourceConstraints: string
  currentStatus: string
  revenueModel: string
}
```

### Naming Conventions

#### CanAI-Specific Patterns
- **Journey Components**: `{StageName}Page.tsx` (e.g., `DiscoveryHookPage.tsx`)
- **API Handlers**: `{domain}.routes.ts` (e.g., `sparks.routes.ts`)
- **Service Classes**: `{Domain}Service.ts` (e.g., `GPT4oService.ts`)
- **Type Definitions**: `{Domain}Types.ts` (e.g., `JourneyTypes.ts`)
- **Hook Names**: `use{Feature}` (e.g., `useSparkGeneration`)

#### Standard TypeScript Conventions
- **Variables/Functions**: camelCase (`generateSparks`, `trustDelta`)
- **Types/Interfaces**: PascalCase (`UserProfile`, `APIResponse`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRIES`, `API_TIMEOUT`)
- **Boolean Prefixes**: `is`, `has`, `should`, `can` (`isGenerating`, `hasError`)

### File Organization Standards

#### Maximum File Sizes
- **Components**: ≤250 lines (excluding imports/exports)
- **Services**: ≤300 lines for AI service complexity
- **Types**: ≤200 lines per type definition file
- **Utilities**: ≤150 lines per utility file

#### Function Complexity Limits
- **Standard Functions**: ≤20 lines
- **AI Processing Functions**: ≤30 lines (complexity allowance)
- **Test Functions**: ≤40 lines
- **Parameters**: ≤4 parameters (use typed objects for complex cases)

### Performance and Optimization

#### React Server Components (RSC)
- **Prefer RSC**: Use RSC for data fetching and <2s performance targets
- **Client Components**: Mark with `'use client'` only when necessary
- **Suspense Boundaries**: Wrap client components with fallbacks
- **Dynamic Loading**: Use `next/dynamic` for non-critical components

#### AI Service Optimization
```typescript
// Memoize expensive AI calculations
const memoizedTrustDelta = useMemo(() => 
  calculateTrustDelta(canaiOutput, genericOutput), 
  [canaiOutput, genericOutput]
)

// Type-safe API calls with error handling
async function generateSparks(inputs: DetailedInputs): Promise<GPTResponse<string[]>> {
  try {
    const response = await gpt4oService.generateSparks(inputs)
    return {
      content: response.sparks,
      tokens: response.usage.total_tokens,
      latency: response.latency,
      confidence: response.confidence
    }
  } catch (error) {
    throw new Error(`Spark generation failed: ${error.message}`)
  }
}
```

#### Supabase Integration
```typescript
// Type-safe Supabase queries with RLS
interface PromptLog {
  id: string
  user_id: string
  journey_stage: JourneyStage
  inputs: DetailedInputs
  created_at: string
}

const savePromptLog = async (data: Omit<PromptLog, 'id' | 'created_at'>) => {
  const { data: result, error } = await supabase
    .from('prompt_logs')
    .insert(data)
    .select()
    .single()
  
  if (error) throw new Error(`Failed to save prompt log: ${error.message}`)
  return result
}
```

### Error Handling Standards

#### Async Error Handling
- **Required**: All async functions must have try/catch or .catch
- **Type-Safe Errors**: Use discriminated union types for error handling
- **Performance**: <100ms error responses

```typescript
type APIResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string; code: number }

async function safeApiCall<T>(fn: () => Promise<T>): Promise<APIResult<T>> {
  try {
    const data = await fn()
    return { success: true, data }
  } catch (error) {
    return { 
      success: false, 
      error: error.message, 
      code: error.status || 500 
    }
  }
}
```

#### Journey-Specific Error Types
```typescript
type JourneyError = 
  | { stage: 'F2'; type: 'validation_failure'; field: keyof DetailedInputs }
  | { stage: 'F3'; type: 'spark_generation_timeout' }
  | { stage: 'F4'; type: 'payment_failure'; provider: 'stripe' }
  | { stage: 'F7'; type: 'deliverable_timeout' }
  | { stage: 'F8'; type: 'comparison_failure' }
```

### AI Integration Patterns

#### GPT-4o Service Integration
```typescript
interface GPT4oService {
  generateSparks(inputs: DetailedInputs): Promise<string[]>
  validateInputs(inputs: Partial<DetailedInputs>): Promise<ValidationResult>
  generateDeliverable(inputs: DetailedInputs, type: ProductType): Promise<string>
  calculateTrustScore(content: string): Promise<number>
}

// Type-safe prompt template system
interface PromptTemplate {
  system: string
  user: (inputs: DetailedInputs) => string
  maxTokens: number
  temperature: number
}
```

#### Hume AI Integration
```typescript
interface HumeAIService {
  analyzeEmotionalResonance(text: string): Promise<EmotionalResonance>
  validateArousalValence(resonance: EmotionalResonance): boolean
  getFallbackScore(): EmotionalResonance // When quota exceeded
}

// Circuit breaker pattern for Hume AI quota
const humeWithFallback = async (text: string): Promise<EmotionalResonance> => {
  if (humeQuotaExceeded) {
    return await gpt4oService.getEmotionalFallback(text)
  }
  return await humeService.analyzeEmotionalResonance(text)
}
```

### Testing Standards

#### Type-Safe Test Patterns
```typescript
// Journey stage test types
interface JourneyTestCase {
  stage: JourneyStage
  inputs: Partial<DetailedInputs>
  expectedOutput: unknown
  performanceTarget: number // milliseconds
}

// Mock type definitions
interface MockGPTResponse {
  content: string
  tokens: number
  latency: number
  confidence: number
}

// Test helper types
type TestScenario = 'sprinkle_haven' | 'serenity_yoga' | 'techtrend'
```

#### Test Organization
- **Unit Tests**: `*.test.ts` files alongside source
- **Integration Tests**: `frontend/tests/integration/`
- **E2E Tests**: `frontend/tests/e2e/`
- **AI Tests**: `backend/tests/ai/`

### Import and Module Standards

#### Path Aliases
- **Frontend**: Use `@/` for `frontend/src/`
- **Backend**: Use `@backend/` for `backend/`
- **Root**: Use `@root/` for workspace root

#### Import Patterns
```typescript
// Prefer named imports
import { generateSparks, validateInputs } from '@/services/gpt4o'
import type { DetailedInputs, JourneyStage } from '@/types/journey'

// Avoid default exports except for pages
export { SparkGenerationService }
export type { SparkGenerationOptions }
```

### Performance Monitoring

#### Type-Safe Analytics
```typescript
interface PerformanceMetric {
  operation: string
  duration: number
  stage: JourneyStage
  success: boolean
}

interface PostHogEvent {
  event: string
  properties: Record<string, unknown>
  timestamp: Date
}

// Track performance with types
const trackPerformance = (metric: PerformanceMetric) => {
  posthog.capture('performance_metric', {
    operation: metric.operation,
    duration: metric.duration,
    stage: metric.stage,
    success: metric.success
  })
}
```

### Security and Validation

#### Input Validation
```typescript
import { z } from 'zod'

const DetailedInputsSchema = z.object({
  businessName: z.string().min(3).max(50),
  businessDescription: z.string().min(10).max(500),
  targetAudience: z.string().min(5).max(200),
  brandVoice: z.enum(['warm', 'bold', 'optimistic', 'professional', 'playful', 'inspirational', 'custom']),
  // ... other fields
})

type ValidatedInputs = z.infer<typeof DetailedInputsSchema>
```

#### RLS Type Safety
```typescript
// Supabase RLS-aware types
interface UserScopedData {
  user_id: string // Always required for RLS
  created_at: string
  updated_at: string
}

interface PromptLog extends UserScopedData {
  id: string
  journey_stage: JourneyStage
  inputs: DetailedInputs
}
```

## Roo Code AI Optimization

### AI Completion Filtering
- **Block Patterns**: `@ts-ignore`, `any` types, `eval`, `with`
- **Suggest Advanced Types**: Mapped types, template literals, conditional types
- **Context Awareness**: Adapt suggestions based on journey stage context

### Refactoring Suggestions
- **Detect**: Large functions (>20 lines), nested conditionals (>2 levels)
- **Suggest**: Extract function, split module, use early returns
- **AI-Specific**: Optimize prompt templates, improve type inference

### Auto-Import Preferences
- **Prioritize**: Path aliases over relative imports
- **Prefer**: Named imports over default imports
- **Context**: Suggest journey-appropriate imports

## Implementation Guidelines

### Development Workflow
1. **Define Types First**: Create type definitions before implementation
2. **Test-Driven**: Write types and tests before functionality
3. **Performance Focus**: Monitor <2s response time targets
4. **AI Integration**: Validate emotional resonance and TrustDelta

### Code Review Standards
- **Type Coverage**: 100% for critical paths (payment, AI generation)
- **Performance**: Validate response time targets
- **Error Handling**: Comprehensive async error coverage
- **Documentation**: JSDoc for public APIs

### Continuous Improvement
- **Metrics Tracking**: Monitor TypeScript compilation times
- **Type Evolution**: Refine types based on AI service changes
- **Performance Optimization**: Regular performance audits

## References

- **PRD Sections**: 6 (Functional Requirements), 7 (Performance), 8 (Architecture)
- **Project Structure**: `frontend/src/`, `backend/`, TypeScript configurations
- **Performance Targets**: <2s response, <100ms errors, 99.9% uptime
- **Quality Metrics**: TrustDelta ≥4.2, emotional resonance >0.7

## Technical Notes

- **Target Directories**: `frontend/src/`, `backend/`, type definition files
- **Supported Stack**: Next.js, Express.js, Supabase, GPT-4o, Hume AI, PostHog
- **TypeScript Version**: Latest stable with strict mode enabled
- **Build Tools**: Vite (frontend), tsc (backend), Vitest (testing)

---

**Updated**: June 18, 2025  
**Version**: 2.0.0  
**Compliance**: PRD Sections 6-8, TypeScript 5.x, CanAI Platform Standards

{
  "version": "2.2.0",
  "metadata": {
    "name": "Roo Code AI Agent TypeScript Rules",
    "description": "Streamlined TypeScript rules for solo developers using Roo Code AI and TaskMaster",
    "lastUpdated": "2025-06-18T08:38:00-06:00",
    "strictnessLevel": "solo"
  },
  "globalSettings": {
    "enforceOnSave": true,
    "enforceOnCommit": false,
    "blockCompletionsOnViolation": false,
    "aiSuggestionFiltering": true
  },
  "profiles": {
    "base": {
      "extends": [
        "strict-null-checks",
        "use-type-guards",
        "prefer-literal-types",
        "prefer-const-assertions",
        "use-prettier",
        "max-function-length",
        "naming-conventions",
        "boolean-prefix",
        "prefer-named-imports",
        "use-absolute-imports",
        "roo-ai-optimizations",
        "roo-auto-imports"
      ]
    },
    "solo": {
      "extends": [
        "base",
        "immutability-and-purity",
        "require-memoization",
        "restrict-heavy-computations",
        "require-resource-cleanup",
        "prefer-early-return",
        "roo-refactoring-suggestions",
        "require-async-error-handling"
      ]
    },
    "test": {
      "extends": [
        "base",
        "testing-requirements",
        "no-shared-state-in-tests"
      ]
    }
  },
  "profileMapping": {
    "**/*.test.ts": "test",
    "**/*": "solo"
  },
  "rules": [
    {
      "id": "strict-null-checks",
      "level": "error",
      "description": "Require explicit handling of null/undefined values using optional chaining, nullish coalescing, or explicit checks.",
      "rationale": "Prevents null-related runtime errors.",
      "category": "type-safety",
      "tags": ["typescript", "null-safety"],
      "autofixable": true,
      "enforceNonNullAssertion": true,
      "requireExplicitUndefinedChecks": true,
      "examples": [
        {
          "valid": "const name = user?.name ?? 'Guest';",
          "invalid": "const name = user.name;"
        }
      ],
      "references": ["https://typescriptlang.org/tsconfig#strictNullChecks"]
    },
    {
      "id": "use-type-guards",
      "level": "error",
      "description": "Use type guards and user-defined type predicates for runtime type checking.",
      "rationale": "Ensures runtime safety and type correctness.",
      "category": "type-safety",
      "tags": ["typescript", "runtime-safety"],
      "autofixable": false,
      "enforceCustomPredicates": true,
      "recommendDiscriminatedUnions": true,
      "examples": [
        {
          "valid": "interface User { kind: 'user'; id: string; } interface Admin { kind: 'admin'; role: string; } function process(entity: User | Admin) { if (entity.kind === 'user') { return entity.id; } }",
          "invalid": "function process(entity: any) { if ('id' in entity) { } } // Avoid 'any'; use 'entity is User' instead"
        }
      ],
      "references": ["https://typescriptlang.org/docs/handbook/2/narrowing.html#user-defined-type-guards"]
    },
    {
      "id": "prefer-literal-types",
      "level": "error",
      "description": "Use literal types for finite sets of values instead of string or number.",
      "rationale": "Enhances type safety.",
      "category": "type-safety",
      "tags": ["typescript", "literal-types"],
      "autofixable": false,
      "requireFor": ["enums", "configurations", "flags"],
      "examples": [
        {
          "valid": "function setAlignment(align: 'left' | 'right' | 'center') { }",
          "invalid": "function setAlignment(align: string) { }"
        }
      ],
      "references": ["https://typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types"]
    },
    {
      "id": "prefer-const-assertions",
      "level": "error",
      "description": "Use 'as const' for immutable literals, objects, and arrays.",
      "rationale": "Enhances type narrowing and immutability.",
      "category": "immutability",
      "tags": ["typescript", "immutability"],
      "autofixable": true,
      "includeArrays": true,
      "includeObjects": true,
      "includeTuples": true,
      "enforceForFunctionArgs": true,
      "examples": [
        {
          "valid": "const req = { url: 'https://example.com', method: 'GET' } as const; handleRequest(req.url, req.method);",
          "invalid": "const req = { url: 'https://example.com', method: 'GET' }; handleRequest(req.url, req.method);"
        }
      ],
      "references": ["https://typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions"]
    },
    {
      "id": "immutability-and-purity",
      "level": "warning",
      "description": "Enforce immutability and purity in functions and state management.",
      "rationale": "Prevents accidental mutations and ensures predictable behavior.",
      "category": "functional",
      "tags": ["functional-programming", "immutability", "purity"],
      "autofixable": false,
      "subRules": [
        {
          "id": "require-immutable-state",
          "description": "Use immutable libraries for complex state updates.",
          "preferredLibraries": ["immer", "redux-toolkit"],
          "note": "Alternative libraries like Immutable.js can be used."
        },
        {
          "id": "immutability-enforcement",
          "description": "Use readonly, Object.freeze(), and immutable data structures.",
          "enforceReadonly": true,
          "requireFreezeForConstants": true,
          "preferImmutableLibraries": ["immer", "immutable"]
        },
        {
          "id": "pure-function-enforcement",
          "description": "Mark and enforce pure functions with @pure JSDoc tag.",
          "requirePureTag": true,
          "detectSideEffects": ["network", "file-io", "global-mutation"]
        }
      ],
      "examples": [
        {
          "valid": "const config = Object.freeze({ host: 'localhost' });",
          "invalid": "const config = { host: 'localhost' }; config.host = 'prod';"
        },
        {
          "valid": "/** @pure */ function add(a: number, b: number): number { return a + b; }",
          "invalid": "function add(a: number, b: number): number { console.log(a); return a + b; }"
        }
      ],
      "references": ["https://redux-toolkit.js.org/", "https://immerjs.github.io/immer/", "https://en.wikipedia.org/wiki/Pure_function"]
    },
    {
      "id": "max-function-length",
      "level": "warning",
      "value": 20,
      "description": "Functions must be ≤20 lines (excluding comments and whitespace).",
      "rationale": "Promotes concise functions.",
      "category": "maintainability",
      "tags": ["clean-code", "readability"],
      "autofixable": false,
      "excludeComments": true,
      "excludeWhitespace": true,
      "examples": [
        {
          "valid": "function sum(a: number, b: number): number { return a + b; }",
          "invalid": "function complexLogic() { /* 25 lines */ }"
        }
      ],
      "references": ["https://cleancoder.com/"]
    },
    {
      "id": "max-file-length",
      "level": "error",
      "value": 250,
      "description": "Files must be ≤250 lines (excluding imports and exports).",
      "rationale": "Ensures readable files.",
      "category": "maintainability",
      "tags": ["clean-code", "readability"],
      "autofixable": false,
      "excludeImports": true,
      "excludeExports": true,
      "examples": [
        {
          "valid": "// 200-line file",
          "invalid": "// 300-line file"
        }
      ],
      "references": ["https://github.com/microsoft/TypeScript/wiki/Coding-guidelines"]
    },
    {
      "id": "max-class-length",
      "level": "error",
      "value": 150,
      "description": "Classes must be ≤150 lines.",
      "rationale": "Prevents overly complex classes.",
      "category": "maintainability",
      "tags": ["clean-code", "solid"],
      "autofixable": false,
      "examples": [
        {
          "valid": "class User { /* 100 lines */ }",
          "invalid": "class GodClass { /* 200 lines */ }"
        }
      ],
      "references": ["https://en.wikipedia.org/wiki/SOLID"]
    },
    {
      "id": "max-function-params",
      "level": "error",
      "value": 4,
      "description": "Functions must have ≤4 parameters. Use typed parameter objects for complex cases.",
      "rationale": "Enhances readability.",
      "category": "maintainability",
      "tags": ["clean-code", "readability"],
      "autofixable": false,
      "enforceTypedObjects": true,
      "allowDestructuring": true,
      "examples": [
        {
          "valid": "function createUser({ name, email }: UserParams): User { }",
          "invalid": "function createUser(name: string, email: string, age: number, role: string, status: string): User { }"
        }
      ],
      "references": ["https://cleancoder.com/"]
    },
    {
      "id": "prefer-early-return",
      "level": "warning",
      "description": "Enforce early returns over nested conditionals (max 2 levels).",
      "rationale": "Reduces complexity.",
      "category": "maintainability",
      "tags": ["clean-code", "complexity"],
      "autofixable": true,
      "maxNestingLevel": 2,
      "enforceGuardClauses": true,
      "examples": [
        {
          "valid": "if (!user) return null; return user.name;",
          "invalid": "if (user) { if (user.name) { return user.name; } }"
        }
      ],
      "references": ["https://refactoring.guru/replace-nested-conditional-with-guard-clauses"]
    },
    {
      "id": "use-prettier",
      "level": "error",
      "description": "Enforce Prettier formatting.",
      "rationale": "Ensures consistent style.",
      "category": "formatting",
      "tags": ["prettier", "style"],
      "autofixable": true,
      "examples": [
        {
          "valid": "const user = { name: 'Alice' };",
          "invalid": "const user = {name: \"Alice\"}"
        }
      ],
      "references": ["https://prettier.io/docs/en/options.html"]
    },
    {
      "id": "naming-conventions",
      "level": "error",
      "description": "Enforce naming: camelCase for variables/functions, PascalCase for types/classes, SCREAMING_SNAKE_CASE for constants.",
      "rationale": "Ensures readable naming.",
      "category": "style",
      "tags": ["typescript", "naming"],
      "autofixable": true,
      "patterns": {
        "variable": "^[a-z][a-zA-Z0-9]*$",
        "function": "^[a-z][a-zA-Z0-9]*$",
        "type": "^[A-Z][a-zA-Z0-9]*$",
        "class": "^[A-Z][a-zA-Z0-9]*$",
        "constant": "^[A-Z][A-Z0-9_]*$",
        "enum": "^[A-Z][a-zA-Z0-9]*$",
        "enumMember": "^[A-Z][A-Z0-9_]*$"
      },
      "examples": [
        {
          "valid": "const USER_COUNT = 100; type UserProfile = {}; function getUser() {}",
          "invalid": "const user_count = 100; type userProfile = {};"
        }
      ],
      "references": ["https://github.com/airbnb/javascript"]
    },
    {
      "id": "boolean-prefix",
      "level": "error",
      "description": "Prefix boolean variables/functions with 'is', 'has', 'should', 'can', 'will', 'did', 'was', 'were'.",
      "rationale": "Clarifies boolean intent.",
      "category": "style",
      "tags": ["typescript", "naming"],
      "autofixable": true,
      "allowedPrefixes": ["is", "has", "should", "can", "will", "did", "was", "were"],
      "examples": [
        {
          "valid": "const isActive = true;",
          "invalid": "const active = true;"
        }
      ],
      "references": ["https://github.com/microsoft/TypeScript/wiki/Coding-guidelines"]
    },
    {
      "id": "prefer-named-imports",
      "level": "error",
      "description": "Use named imports/exports over default exports.",
      "rationale": "Improves tree-shaking and IDE support.",
      "category": "modules",
      "tags": ["typescript", "imports"],
      "autofixable": true,
      "prohibitDefaultExports": true,
      "enforceNamedExports": true,
      "examples": [
        {
          "valid": "export { add }; import { add } from './math';",
          "invalid": "export default add; import add from './math';"
        }
      ],
      "references": ["https://esbuild.github.io/content-types/#tree-shaking"]
    },
    {
      "id": "use-absolute-imports",
      "level": "error",
      "description": "Use absolute imports with path aliases (e.g., @/utils).",
      "rationale": "Simplifies imports.",
      "category": "modules",
      "tags": ["typescript", "imports"],
      "autofixable": true,
      "enforceForInternal": true,
      "requirePathAliases": true,
      "examples": [
        {
          "valid": "import { utils } from '@/utils';",
          "invalid": "import { utils } from '../../utils';"
        }
      ],
      "references": ["https://typescriptlang.org/docs/handbook/module-resolution.html#path-mapping"]
    },
    {
      "id": "roo-ai-optimizations",
      "level": "error",
      "description": "Block AI completions that violate type safety or suggest anti-patterns.",
      "rationale": "Ensures AI-generated code quality.",
      "category": "ai-optimization",
      "tags": ["roo", "ai-assisted"],
      "autofixable": false,
      "blockPatterns": ["@ts-ignore", "eval", "with"],
      "suggestAdvancedTypes": ["mapped-types", "template-literals"],
      "examples": [
        {
          "valid": "AI suggests: type Keys = keyof T;",
          "invalid": "AI suggests: type Keys = string;"
        }
      ],
      "references": ["https://roo.sh/docs"]
    },
    {
      "id": "roo-auto-imports",
      "level": "error",
      "description": "Prioritize TypeScript path aliases and named imports in AI auto-imports.",
      "rationale": "Optimizes AI import suggestions.",
      "category": "ai-optimization",
      "tags": ["roo", "ai-assisted"],
      "autofixable": true,
      "preferPathAliases": true,
      "preferNamedImports": true,
      "examples": [
        {
          "valid": "AI suggests: import { utils } from '@/utils';",
          "invalid": "AI suggests: import utils from '../../utils';"
        }
      ],
      "references": ["https://roo.sh/docs"]
    },
    {
      "id": "roo-refactoring-suggestions",
      "level": "warning",
      "description": "Require AI to suggest refactorings for complex code.",
      "rationale": "Improves code quality.",
      "category": "ai-optimization",
      "tags": ["roo", "refactoring"],
      "autofixable": false,
      "detectPatterns": ["large-functions", "nested-conditionals"],
      "suggestRefactorings": ["extract-function", "split-module"],
      "examples": [
        {
          "valid": "AI suggests: Extract 'calculateTotal' into a separate function.",
          "invalid": "AI ignores: 50-line function with nested conditionals."
        }
      ],
      "references": ["https://refactoring.guru/"]
    },
    {
      "id": "require-memoization",
      "level": "warning",
      "description": "Require memoization for complex calculations and selectors.",
      "rationale": "Optimizes performance.",
      "category": "performance",
      "tags": ["performance", "sustainability"],
      "autofixable": false,
      "requireFor": ["recursive-functions", "expensive-computations", "selectors"],
      "examples": [
        {
          "valid": "const selectUser = memoize((state) => state.user);",
          "invalid": "const selectUser = (state) => state.user;"
        }
      ],
      "references": ["https://lodash.com/docs/4.17.15#memoize"]
    },
    {
      "id": "restrict-heavy-computations",
      "level": "warning",
      "description": "Flag energy-intensive operations and suggest optimization.",
      "rationale": "Reduces resource usage.",
      "category": "sustainability",
      "tags": ["performance", "green-coding"],
      "autofixable": false,
      "requireProfiling": ["nested-loops", "large-data-processing", "crypto-functions"],
      "suggestAlternatives": ["virtual-dom", "batch-updates", "web-workers", "lazy-loading", "pagination"],
      "examples": [
        {
          "valid": "const result = memoize(expensiveCalc(data));",
          "invalid": "for (let i = 0; i < 1000000; i++) { crypto.hash(data); }"
        }
      ],
      "references": ["https://green-coding.io/"]
    },
    {
      "id": "require-resource-cleanup",
      "level": "error",
      "description": "Require cleanup of resources like event listeners or timers.",
      "rationale": "Prevents memory leaks.",
      "category": "performance",
      "tags": ["performance", "memory"],
      "autofixable": false,
      "requireFor": ["event-listeners", "timers", "subscriptions"],
      "examples": [
        {
          "valid": "onUnmounted(() => { window.removeEventListener('resize', handler); });",
          "invalid": "onMounted(() => { window.addEventListener('resize', handler); });"
        }
      ],
      "references": ["https://vuejs.org/guide/essentials/lifecycle.html"]
    },
    {
      "id": "testing-requirements",
      "level": "warning",
      "description": "Require tests for public functions and classes.",
      "rationale": "Ensures code quality.",
      "category": "testing",
      "tags": ["testing", "quality"],
      "autofixable": false,
      "minimumCoverage": 80,
      "requireUnitTests": true,
      "enforceTestNaming": true,
      "preferredTestFrameworks": ["jest", "vitest"],
      "examples": [
        {
          "valid": "describe('add', () => { it('sums numbers', () => { expect(add(1, 2)).toBe(3); }); });",
          "invalid": "// No tests for function add"
        }
      ],
      "references": ["https://jestjs.io/docs/getting-started"]
    },
    {
      "id": "no-shared-state-in-tests",
      "level": "error",
      "description": "Prohibit shared state between tests to prevent flakiness.",
      "rationale": "Ensures test isolation.",
      "category": "testing",
      "tags": ["testing", "quality"],
      "autofixable": false,
      "prohibitGlobalMutations": true,
      "requireTestIsolation": true,
      "examples": [
        {
          "valid": "beforeEach(() => { state = initialState; });",
          "invalid": "let state = initialState; // Shared across tests"
        }
      ],
      "references": ["https://kentcdodds.com/blog/write-tests"]
    },
    {
      "id": "enforce-layered-architecture",
      "level": "warning",
      "description": "Ensure files follow architectural layer boundaries (e.g., UI ➡ service ➡ domain ➡ infra).",
      "rationale": "Promotes scalability.",
      "category": "architecture",
      "tags": ["clean-architecture", "multitier"],
      "autofixable": false,
      "enforceLayers": ["ui", "service", "domain", "infra"],
      "layerDependencies": {
        "ui": ["service"],
        "service": ["domain"],
        "domain": ["infra"],
        "infra": []
      },
      "examples": [
        {
          "valid": "import { getUser } from '@/services/user';",
          "invalid": "import { queryDB } from '@/infra/db';"
        }
      ],
      "references": ["https://en.wikipedia.org/wiki/Multitier_architecture"]
    },
    {
      "id": "dependency-management",
      "level": "warning",
      "description": "Enforce dependency injection and inversion of control principles.",
      "rationale": "Improves testability.",
      "category": "architecture",
      "tags": ["dependency-injection", "testability"],
      "autofixable": false,
      "requireDependencyInjection": true,
      "prohibitDirectDependencies": true,
      "examples": [
        {
          "valid": "class UserService { constructor(private repo: UserRepository) {} }",
          "invalid": "class UserService { private repo = new UserRepository(); }"
        }
      ],
      "references": ["https://inversify.io/"]
    },
    {
      "id": "prefer-dependency-injection",
      "level": "warning",
      "description": "Require dependency injection using frameworks like Inversify or tsyringe.",
      "rationale": "Enhances testability.",
      "category": "architecture",
      "tags": ["dependency-injection", "testability"],
      "autofixable": false,
      "recommendedFrameworks": ["inversify", "tsyringe"],
      "requireForServices": true,
      "note": "Alternative frameworks like NestJS can be used for dependency injection.",
      "examples": [
        {
          "valid": "@injectable() class UserService { constructor(@inject('UserRepository') repo: UserRepository) {} }",
          "invalid": "class UserService { private repo = new UserRepository(); }"
        }
      ],
      "references": ["https://github.com/inversify/InversifyJS", "https://github.com/microsoft/tsyringe"]
    },
    {
      "id": "code-complexity-limits",
      "level": "warning",
      "description": "Enforce complexity limits: cyclomatic complexity ≤5, cognitive complexity ≤7.",
      "rationale": "Ensures maintainable code.",
      "category": "maintainability",
      "tags": ["complexity", "readability"],
      "autofixable": false,
      "cyclomaticComplexity": 5,
      "cognitiveComplexity": 7,
      "maxComplexityExceptions": ["sorting-algorithms", "graph-traversal"],
      "examples": [
        {
          "valid": "function simple(a: number): number { if (a > 0) return 1; return 0; } // Cyclomatic complexity: 2",
          "invalid": "function complex(a: number): number { if (a > 0) { if (a < 10) { return 1; } else if (a < 20) { return 2; } } else { return 0; } } // Cyclomatic complexity: 4"
        }
      ],
      "references": ["https://www.sonarsource.com/docs/CognitiveComplexity.pdf"]
    },
    {
      "id": "require-async-error-handling",
      "level": "error",
      "description": "Require try/catch or .catch on awaited promises outside of test code.",
      "rationale": "Ensures proper error handling for asynchronous operations.",
      "category": "error-handling",
      "tags": ["async", "error-handling"],
      "autofixable": false,
      "examples": [
        {
          "valid": "try { await fetchData(); } catch (error) { console.error(error); }",
          "invalid": "await fetchData();"
        }
      ],
      "references": ["https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch"]
    }
  ],
  "overrides": [
    {
      "files": ["*.test.ts", "*.spec.ts"],
      "rules": [
        {
          "id": "max-function-params",
          "value": 5
        },
        {
          "id": "max-function-length",
          "value": 40
        },
        {
          "id": "max-class-length",
          "value": 200
        }
      ]
    },
    {
      "files": ["*.d.ts"],
      "rules": []
    },
    {
      "files": ["*.config.ts", "*.config.js", "vite.config.ts"],
      "rules": [
        {
          "id": "prefer-named-imports",
          "level": "off"
        },
        {
          "id": "max-file-length",
          "value": 300
        },
        {
          "id": "use-absolute-imports",
          "level": "off",
          "description": "Allow relative imports in config files."
        }
      ]
    },
    {
      "files": ["src/infra/**"],
      "rules": [
        {
          "id": "code-complexity-limits",
          "cyclomaticComplexity": 7,
          "cognitiveComplexity": 10,
          "description": "Allow slightly higher complexity in infra code."
        }
      ]
    }
  ],
  "integrations": {
    "roo": {
      "enableAIFiltering": true,
      "blockViolatingCompletions": false,
      "enhanceSuggestions": true,
      "provideAlternatives": true,
      "enableContextualSuggestions": true,
      "adaptToDirectory": true,
      "directoryRules": {
        "src/ui/**": ["prefer-early-return"],
        "src/core/**": ["require-memoization"],
        "src/services/**": [],
        "src/infra/**": ["require-resource-cleanup"]
      }
    },
    "typescript": {
      "strictMode": true,
      "exactOptionalPropertyTypes": true,
      "noUncheckedIndexedAccess": true
    },
    "eslint": {
      "extends": ["@typescript-eslint/strict", "@typescript-eslint/stylistic", "plugin:security/recommended"],
      "plugins": ["@typescript-eslint", "import", "security"]
    },
    "prettier": {
      "enforce": true,
      "config": ".prettierrc"
    },
    "markdownlint": {
      "enforce": true,
      "config": ".markdownlintrc",
      "rules": {
        "MD013": { "line_length": 80 },
        "MD032": true,
        "MD041": true
      }
    }
  },
  "ci": {
    "failOnError": true,
    "failOnWarning": false,
    "enforceConventionalCommits": true
  }
}




