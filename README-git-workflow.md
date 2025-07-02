# TaskMaster Git Workflow Quick Reference

This guide outlines the branch and commit message standards for the CanAI Emotional Sovereignty Platform, ensuring traceability and alignment with TaskMaster, PRD-driven development, and commitlint rules.

## 1. Branch Naming Pattern

- **Format:**

  ```
  feature/task-{id}-{slug}
  ```

  - `{id}`: TaskMaster task ID (e.g., 2.5)
  - `{slug}`: Short, kebab-case description (e.g., rls-logging-business-tables)

- **Example:**
  ```
  feature/task-2.5-rls-logging-business-tables
  ```

## 2. Commit Message Pattern (Conventional Commits)

> **Important:** Your commit messages must follow the [conventional commit](https://github.com/conventional-changelog/commitlint/#wha) format enforced by commitlint/husky. **Do NOT use the TaskMaster pattern in commit messages.**

- **Format:**

  ```
  <type>(<scope>): <subject in lower-case>

  <body - start with a blank line, use dashes for bullet points>
  ```

  - **type:** feat, fix, docs, test, chore, etc. (see allowed list below)
  - **scope:** backend, api, tests, etc. (see allowed list below)
  - **subject:** concise, lower-case summary

- **Example:**
  ```
  feat(backend): complete task 2.5 - implement row level security policies for logging and business tables

  - add rls to payment_logs and business_tables
  - update integration tests for rls
  - prd.md F4, strategy section 4
  ```

- **Allowed types:** feat, fix, docs, style, refactor, perf, test, chore, ci, build, revert, security, canai
- **Allowed scopes:** frontend, backend, api, auth, ui, db, config, deps, ci, docs, tests, security, performance, llm, analytics, cortex, journey, supabase, memberstack, make, posthog, cursor, taskmaster

## 3. PR Titles and TaskMaster Traceability

- **Use the TaskMaster pattern for PR titles and descriptions, NOT for commit messages.**
- **PR Title Format:**
  ```
  TaskMaster: complete task 2.5 - Implement Row Level Security policies for logging and business tables
  ```
- In the PR description, reference the TaskMaster task and PRD section for traceability.

## 4. Workflow Steps

1. **Start from main:**
   ```bash
   git checkout main
   git pull origin main
   ```
2. **Create a new branch:**
   ```bash
   git checkout -b feature/task-2.5-rls-logging-business-tables
   ```
3. **Commit as you work:**
   ```bash
   git add .
   git commit
   # Use the template below (or run git cz for interactive commit)
   ```
4. **Push your branch:**
   ```bash
   git push origin feature/task-2.5-rls-logging-business-tables
   ```
5. **Open a Pull Request:**
   - Title:
     `TaskMaster: complete task 2.5 - Implement Row Level Security policies for logging and business tables`
   - Reference the TaskMaster task and PRD section in the description.
6. **After merge:**
   ```bash
   git branch -d feature/task-2.5-rls-logging-business-tables
   git push origin --delete feature/task-2.5-rls-logging-business-tables
   ```

## 5. Commit Message Template

Create a `.gitmessage.txt` file in your project root with:

```
<type>(<scope>): <subject in lower-case>

<body - start with a blank line, use dashes for bullet points>
```

Set as your default with:
```bash
git config --global commit.template .gitmessage.txt
```

## 6. Commitizen (Recommended)

Install commitizen for interactive, error-proof commits:
```bash
npm install -g commitizen
```
Then use:
```bash
git cz
```

## 7. References
- [commitlint docs](https://github.com/conventional-changelog/commitlint/#wha)
- [TaskMaster documentation]

---
**Keep this file updated as your workflow evolves. The AI agent will use this as a reference to guide you and future contributors.**
