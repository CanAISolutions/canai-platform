# Commit Guidelines (Conventional Commits + TaskMaster)

## 1. Commit Message Format (for code commits)

Your commit messages **must** follow the [conventional commit](https://github.com/conventional-changelog/commitlint/#wha) format enforced by commitlint/husky:

```
<type>(<scope>): <subject in lower-case>

<body - start with a blank line, use dashes for bullet points>
```

- **type:** feat, fix, docs, style, refactor, perf, test, chore, ci, build, revert, security, canai
- **scope:** frontend, backend, api, auth, ui, db, config, deps, ci, docs, tests, security, performance, llm, analytics, cortex, journey, supabase, memberstack, make, posthog, cursor, taskmaster
- **subject:** concise, lower-case summary

### Example
```
feat(backend): complete task 7.4 - refund processing

- fix webhook test setup for raw body parsing
- add signature failure simulation in tests
- all requirements for refund processing now pass integration tests
- prd.md F4, stripe-payment-strategy.md, and progress log updated
```

## 2. PR Titles and TaskMaster Traceability

- Use the TaskMaster pattern for PR titles and descriptions, NOT for commit messages.
- **PR Title Example:**
  ```
  TaskMaster: complete task 7.4 - Refund Processing
  ```

## 3. Commit Message Template

A `.gitmessage.txt` template is provided in the project root. Set it as your default:
```bash
git config --global commit.template .gitmessage.txt
```

## 4. Commitizen (Recommended)

Install commitizen for interactive, error-proof commits:
```bash
npm install -g commitizen
```
Then use:
```bash
git cz
```

## 5. References
- [commitlint docs](https://github.com/conventional-changelog/commitlint/#wha)
- [README-git-workflow.md] 