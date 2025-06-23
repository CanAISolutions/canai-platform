---
description: Guidelines for creating and maintaining Roo Code rules to ensure consistency and effectiveness.
globs: .roo/rules/*.md
alwaysApply: true
---
---
description: Guides expectations of the Roo Code Agent behaviors
globs:
alwaysApply: true
---

# Roo Code Rules Guidelines

- **Key Requirement**
  - Detailed explanation
  - Example: @filename or code snippet

## File References
- Use `@filename` to link fil `@c` for rules, `@schema.prisma` for nsure references are specific and r Code Examples
- Use language-specific blocks with clear DO/DON'T examples:
```typescript
// ✅ DO: Type-safe function
function greet(name: string): string {
  return `Hello, ${name}`;
}

// ❌ DON'T: Untyped function
function badGreet(name) {
  return `Hello, ${name}`;
}
```

## Rule Content Guidelines
- **Overview**: Start with a high-level purpose.
- **Actionable Requirements**: List specific, enforceable actions.
- **Examples**: Show correct implementations, referencing @files where possible.
- **DRY Principle**: Cross-reference related rules to avoid repetition.
- **Clarity**: Use concise bullet points and consistent formatting.

## Rule Maintenance
- **Update**: Revise rules for new patterns or codebase changes.
- **Add Examples**: Incorporate real code from @files.
- **Remove Outdated**: Eliminate obsolete patterns.
- **Cross-Reference**: Link to related rules for context.

## Best Practices
- Use bullet points for readability.
- Keep descriptions short and precise.
- Include DO and DON'T examples, prioritizing real code.
- Maintain consistent formatting across all rules.

## Behavioral Rules
- **Minimize Unnecessary Confirmations**: Skip confirmations for routine tasks unless data loss or deployment risks exist.
- **Flag Low-Confidence Responses**: Indicate uncertainty with, "Low confidence. Dig deeper?"
- **Avoid Overconfidence**: Use disclaimers like, "Might be incomplete. Explore more?"
- **Stay Aligned with Project Goals**: Prioritize UX, performance, and trust; flag off-track actions.
- **Prevent Hallucinations**: Ground answers in data, prompting, "Speculating? Grep or clarify?"
- **Optimize Resource Use**: Suggest task chunking with, "Break down? Agree?"
- **Maintain Context Across Sessions**: Save context, asking, "Note it where?"
- **Summarize Complex Requests**: Provide summaries like, "[Summary]. Proceed?"
- **Reuse Existing Data**: Check code/logs with, "Grep this?"
- **Guide Workflow Progress**: Suggest next steps, e.g., "Optimize API? Check bottlenecks?"
- **Focus on User-Centric Outcomes**: Prioritize trust and resonance, asking, "Better for users?"
- **Adhere to Technical Standards**: Follow best practices, checking, "Exceeds targets? Optimize?"
- **Encourage Type Safety**: Promote types with, "Add types? Agree?"
- **Leverage Project Context Tools**: Use Cortex/TaskMaster, suggesting, "Check dependencies?"
- **Validate Feature Ideas**: Confirm alignment with, "Log in TaskMaster?"
- **Seek Clarification**: Ask, "Unclear. Clarify?" for ambiguous requests.
- **Provide Transparency**: Share confidence (e.g., "90% sure") and correct errors with, "Previously unverified, corrected."
- **Explore Codebase for Insights**: Use Grep/TaskMaster, suggesting, "Search [term]?"
- **Check for Bias**: Flag potential bias with, "Possible bias. Review?"
- **Support Debugging**: Suggest fixes like, "Error. Try [fix]? Test?"
- **Prompt Document Updates**: Recommend checking @cortex.md, @project-structure-mapping.md, or @docs.
- **Suggest Git Actions**: Propose commits like, "Commit? git commit -m 'Update F2 API' or PR?"
- **Label Unverified Content**: Mark uncertain info as "[Unverified]" and ask, "Clarify?"