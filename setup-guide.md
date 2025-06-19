# Ultimate Guide to Setting Up a Cursor Workspace for `.mdc` Configuration and Taskmaster AI PRD Breakdown

This guide provides a definitive blueprint for preparing a **Cursor** workspace to enforce code
quality and documentation standards via an `.mdc` configuration and to break down a Product
Requirements Document (PRD) into actionable tasks using **Taskmaster AI**. As Cursor does not
natively parse `.mdc` files, we configure standard tools (ESLint, Prettier, markdownlint) to enforce
`.mdc`-inspired rules, ensuring **consistent, clean, sustainable, reliable, and well-documented**
TypeScript development. Simultaneously, we set up Taskmaster AI to generate precise tasks from your
PRD, leveraging Cursor’s AI capabilities. This setup covers repository organization, tooling, AI
optimization, pre-commit hooks, CI/CD, team workflows, and maintenance, supporting Mac, Windows,
Linux, and alternative IDEs like VS Code.

## Purpose

- **Code Quality**: Enforce strict TypeScript linting (e.g., no `any`, TSDoc comments).
- **Documentation**: Ensure clear Markdown docs with required sections (`Purpose`, `Usage`,
  `Examples`).
- **Task Generation**: Use Taskmaster AI to create actionable tasks from a PRD.
- **AI Optimization**: Leverage Cursor’s AI for compliant code and task generation.
- **Team Alignment**: Standardize workflows with pre-commit hooks, CI, and onboarding.
- **Scalability**: Support large codebases and evolving standards.

## Prerequisites

- **Node.js**: Version 20 (specified in `.nvmrc`).
- **Cursor**: Latest version with ESLint, Prettier, markdownlint, and Taskmaster AI extensions.
- **Dependencies**: See `package.json` in [Additional Notes](#additional-notes).
- **Project Structure**:
  ```
  your-project/
  ├── .cursor/          # MDC configuration
  ├── .taskmaster/      # Taskmaster AI configuration
  ├── src/              # TypeScript code
  ├── tests/            # Test files
  ├── docs/             # Documentation
  ├── scripts/          # Scripts and utilities
  ├── package.json
  ├── tsconfig.json
  ├── .env              # API keys (gitignored)
  ```

## Steps to Implement `.mdc` and Taskmaster AI

### 1. Initialize a Clean Repository

**Action**: Start with a fresh repository or isolated branch to avoid legacy code interference.

- Create a new repo or branch (e.g., `project-taskmaster-decomp`).
- Initialize Git:
  ```bash
  git init
  git commit -m "chore: initialize repository"
  ```
- Create `.gitignore`:
  ```
  node_modules/
  .env
  dist/
  coverage/
  ```

**Purpose**: Ensures a noise-free environment for Taskmaster AI and `.mdc` enforcement.

### 2. Set Up `.mdc` Configuration

**Action**: Create a `.cursor/` directory with `index.mdc` and `rules/` subdirectory, aligning with
Cursor’s April 2025 folder-based rule layout.

**File Structure**:

```
.cursor/
  ├── index.mdc
  └── rules/
      ├── typescript.mdc
      └── docs.mdc
```

**Example `index.mdc`** (root-level rules):

```yaml
---
description: Core linting rules for the entire repository
globs: ['**/*.{ts,tsx,md}']
alwaysApply: true
tags: [typescript, markdown, lint]
---
{
  'version': 1,
  'metadata':
    {
      'name': 'Project Config',
      'description': 'Strict TypeScript and Markdown standards',
      'lastUpdated': '2025-06-18',
      'strictnessLevel': 'strict',
    },
  'rules':
    {
      'typescript': { 'no-explicit-any': 'error', 'strict-null-checks': 'error' },
      'markdown': { 'require-clear-markdown-docs': 'error' },
    },
}
```

**Example `rules/typescript.mdc`**:

```yaml
---
description: Enforce strict TypeScript and Prettier presets
globs: ['src/**/*.ts', 'src/**/*.tsx']
alwaysApply: false
tags: [typescript, lint]
---
{
  'rules':
    {
      'explicit-function-return-type': 'error',
      'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
      'cursor-ai-optimizations': { 'block-any-type': 'error', 'require-tsdoc': 'warning' },
    },
}
```

**Example `rules/docs.mdc`**:

```yaml
---
description: Enforce clear Markdown documentation
globs: ['README.md', 'docs/*.md']
alwaysApply: false
tags: [markdown, docs]
---
{
  'rules':
    {
      'require-clear-markdown-docs': 'error',
      'maxParagraphLength': 100,
      'requiredSections': ['Purpose', 'Usage', 'Examples'],
    },
}
```

**Purpose**: Defines linting, documentation, and AI optimization rules for TypeScript and Markdown.

### 3. Scaffold Project Structure

**Action**: Set up a TypeScript project and Taskmaster AI directories.

- **For TypeScript**:

  - Use a starter template (e.g., `npx create-next-app@latest --typescript`).
  - Create folders: `/src`, `/tests`, `/docs`, `/scripts`.
  - Add placeholders: `src/index.ts`, `tests/index.test.ts`, `docs/PRD.md`, `README.md`.

- **For Taskmaster AI**:
  - Run:
    ```bash
    npm i -g task-master-ai
    task-master init
    ```
  - Creates: `.taskmaster/`, `.taskmaster/docs/prd.txt`, `.taskmaster/templates/example_prd.txt`.

**Purpose**: Provides a predictable structure for both `.mdc` enforcement and Taskmaster AI task
generation.

### 4. Prepare a Detailed PRD

**Action**: Draft a comprehensive PRD and place it in the correct location.

- Create a detailed PRD in `.taskmaster/docs/prd.txt` (new projects) or `/scripts/prd.txt` (existing
  projects).
- Use `.taskmaster/templates/example_prd.txt` for structure (e.g., requirements, user stories,
  acceptance criteria).
- Example PRD snippet:

  ```markdown
  # User Authentication Service

  ## Purpose

  Provide secure user authentication for the platform.

  ## Requirements

  - Support login via email/password and OAuth.
  - Implement JWT-based session management.

  ## Acceptance Criteria

  - Login endpoint returns 200 with valid credentials.
  - OAuth redirects to provider and returns token.

  ## Technical Specs

  - Use TypeScript, Express, and Passport.js.
  ```

**Purpose**: Ensures Taskmaster AI generates precise, actionable tasks.

### 5. Configure Taskmaster AI

**Action**: Set up Taskmaster AI integration with Cursor.

- **Install**:

  ```bash
  npm i -g task-master-ai
  ```

- **Configure API Keys**:

  - Create `.env` (gitignored):
    ```
    ANTHROPIC_API_KEY=your-key-here
    ```
  - Add to `.cursor/mcp.json`:
    ```json
    {
      "taskmaster-ai": {
        "command": "npx task-master-ai",
        "apiKeys": ["ANTHROPIC_API_KEY"]
      }
    }
    ```

- **Initialize**:
  - Run in Cursor’s chat pane:
    ```
    Can you please initialize taskmaster-ai for this project?
    ```
  - Verify MCP server (e.g., `task-master list` shows green status).

**Purpose**: Enables Taskmaster AI to parse PRD and generate tasks.

### 6. Set Up ESLint for `.mdc` Rules

**Action**: Configure ESLint to mirror `.mdc` TypeScript rules.

- **Install**:

  ```bash
  npm install --save-dev eslint@8.57.0 @typescript-eslint/parser@6.21.0 @typescript-eslint/eslint-plugin@6.21.0 eslint-plugin-import@2.29.1 eslint-plugin-security@1.7.1 eslint-plugin-jsx-a11y@6.8.0 eslint-plugin-tsdoc@0.2.17 eslint-plugin-simple-import-sort@10.0.0 eslint-config-prettier@9.1.0
  ```

- **Create `.eslintrc.json`**:

  ```json
  {
    "env": { "node": true, "es2021": true },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
      "ecmaVersion": 12,
      "sourceType": "module",
      "project": "./tsconfig.json"
    },
    "extends": [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:@typescript-eslint/recommended-requiring-type-checking",
      "plugin:import/recommended",
      "plugin:security/recommended",
      "plugin:jsx-a11y/recommended",
      "prettier"
    ],
    "plugins": [
      "@typescript-eslint",
      "import",
      "security",
      "jsx-a11y",
      "tsdoc",
      "simple-import-sort"
    ],
    "rules": {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": ["error", { "allowExpressions": true }],
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "import/no-default-export": "error",
      "security/detect-unsafe-regex": "error",
      "jsx-a11y/alt-text": "error",
      "tsdoc/syntax": "warn",
      "simple-import-sort/imports": "error"
    }
  }
  ```

- **Create `.eslintignore`**:

  ```
  node_modules
  dist
  coverage
  ```

- **Map `.mdc` to ESLint** (if needed):

  ```javascript
  // scripts/sync-mdc.js
  const fs = require('fs');
  const mdcConfig = JSON.parse(fs.readFileSync('.cursor/index.mdc', 'utf8').split('---')[2]);
  const tsConfig = JSON.parse(
    fs.readFileSync('.cursor/rules/typescript.mdc', 'utf8').split('---')[2]
  );

  const eslintRules = { ...mdcConfig.rules.typescript, ...tsConfig.rules };
  fs.writeFileSync(
    '.eslintrc.json',
    JSON.stringify(
      {
        env: { node: true, es2021: true },
        parser: '@typescript-eslint/parser',
        parserOptions: { ecmaVersion: 12, sourceType: 'module', project: './tsconfig.json' },
        extends: [
          'eslint:recommended',
          'plugin:@typescript-eslint/recommended',
          'plugin:@typescript-eslint/recommended-requiring-type-checking',
          'plugin:import/recommended',
          'plugin:security/recommended',
          'plugin:jsx-a11y/recommended',
          'prettier',
        ],
        plugins: [
          '@typescript-eslint',
          'import',
          'security',
          'jsx-a11y',
          'tsdoc',
          'simple-import-sort',
        ],
        rules: eslintRules,
      },
      null,
      2
    )
  );
  ```

  - Run: `node scripts/sync-mdc.js`

- **Security Review**: Document `eslint-plugin-security` warnings in GitHub issues/PR comments
  (e.g., “Optimized regex to avoid ReDoS”).

**Purpose**: Enforces `.mdc` TypeScript rules, ensuring accessibility and import consistency.

**Cursor Integration**:

- Enable ESLint in Cursor settings (`Cmd + ,` or `Ctrl + ,`).
- Install `cursor.extensions.eslint`.

### 7. Configure TypeScript

**Action**: Update `tsconfig.json` for `.mdc` compatibility.

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "esModuleInterop": true,
    "moduleResolution": "node",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "outDir": "./dist",
    "sourceMap": true
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Purpose**: Ensures strict type safety for `.mdc` rules.

### 8. Set Up Prettier

**Action**: Configure Prettier for code and Markdown.

- **Install**:

  ```bash
  npm install --save-dev prettier@3.2.5 prettier-plugin-md@0.1.0
  ```

- **Create `.prettierrc`**:

  ```json
  {
    "tabWidth": 2,
    "singleQuote": true,
    "trailingComma": "es5",
    "semi": true,
    "printWidth": 100,
    "proseWrap": "always"
  }
  ```

- **Create `.prettierignore`**:
  ```
  node_modules
  dist
  coverage
  ```

**Purpose**: Ensures consistent formatting, aligning with `.mdc`’s `maxParagraphLength`.

**Cursor Integration**:

- Enable “Format on Save” in Cursor settings.
- Install `cursor.extensions.prettier`.

### 9. Configure Markdown Linting and Validation

**Action**: Set up `markdownlint` and section validation for `.mdc`’s `require-clear-markdown-docs`.

- **Install**:

  ```bash
  npm install --save-dev markdownlint@0.26.2 markdownlint-cli@0.32.2 markdown-section-validator@1.0.0
  ```

- **Create `.markdownlintrc`**:

  ```json
  {
    "MD013": { "line_length": 100 },
    "MD032": true,
    "MD041": false,
    "MD004": { "style": "consistent" },
    "MD007": { "indent": 2 },
    "MD012": { "maximum": 1 },
    "include": ["README.md", "docs/*.md", "docs/api/*.md"]
  }
  ```

- **Create `scripts/validate-md-sections.js`**:

  ```javascript
  const msv = require('markdown-section-validator');
  const fs = require('fs');

  const files = ['README.md', ...fs.readdirSync('docs').map(f => `docs/${f}`)];
  const requiredSections = ['## Purpose', '## Usage', '## Examples'];

  files.forEach(file => {
    if (!msv.validate(file, { sections: requiredSections })) {
      console.error(`${file} missing required sections: ${requiredSections.join(', ')}`);
      process.exit(1);
    }
  });
  ```

- **Update `package.json`**:
  ```json
  {
    "scripts": {
      "lint:md": "markdownlint README.md 'docs/*.md' 'docs/api/*.md'",
      "validate:md": "node scripts/validate-md-sections.js"
    }
  }
  ```

**Purpose**: Enforces Markdown standards and required sections.

**Cursor Integration**:

- Install `cursor.extensions.markdownlint`.
- Run `npm run lint:md` and `npm run validate:md`.

### 10. Set Up Pre-commit Hooks

**Action**: Use `husky` and `lint-staged` for pre-commit linting.

- **Install**:

  ```bash
  npm install --save-dev husky@9.0.11 lint-staged@15.2.0
  ```

- **Initialize**:

  ```bash
  npx husky install
  npx husky add .husky/pre-commit "npx lint-staged"
  ```

- **Update `package.json`**:
  ```json
  {
    "lint-staged": {
      "src/**/*.{ts,tsx}": ["eslint --cache --fix", "prettier --write"],
      "*.md": ["markdownlint --fix", "prettier --write"],
      "README.md": ["node scripts/validate-md-sections.js"],
      "docs/*.md": ["node scripts/validate-md-sections.js"]
    }
  }
  ```

**Purpose**: Ensures code and docs are linted before commits.

### 11. Set Up Commit-Message Linting

**Action**: Enforce Conventional Commits.

- **Install**:

  ```bash
  npm install --save-dev @commitlint/config-conventional@19.0.3 @commitlint/cli@19.0.3
  ```

- **Create `commitlint.config.js`**:

  ```javascript
  module.exports = { extends: ['@commitlint/config-conventional'] };
  ```

- **Add to Husky**:
  ```bash
  npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
  ```

**Purpose**: Standardizes commits for automated changelogs.

### 12. Generate API Documentation with TypeDoc

**Action**: Generate Markdown API docs from TSDoc comments.

- **Install**:

  ```bash
  npm install --save-dev typedoc@0.26.0 typedoc-plugin-markdown@4.0.0
  ```

- **Create `typedoc.json`**:

  ```json
  {
    "entryPoints": ["src/index.ts"],
    "out": "docs/api",
    "plugin": ["typedoc-plugin-markdown"],
    "readme": "none"
  }
  ```

- **Update `package.json`**:
  ```json
  {
    "scripts": {
      "docs": "typedoc"
    }
  }
  ```

**Purpose**: Generates `.mdc`-compliant API documentation.

### 13. Set Up CI for `.mdc` and Taskmaster AI

**Action**: Configure GitHub Actions for linting, validation, and task generation.

- **Create `.github/workflows/lint.yml`**:

  ```yaml
  name: Lint and TypeCheck
  on:
    push:
      branches: [main]
    pull_request:
      branches: [main]
  jobs:
    lint:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
          with:
            fetch-depth: 0
        - uses: actions/setup-node@v4
          with:
            node-version: 20
            cache: 'npm'
        - uses: actions/cache@v4
          with:
            path: |
              node_modules
              ~/.cache
            key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
        - run: npm ci
        - name: Lint changed TypeScript files
          run:
            npx eslint $(git diff --name-only --diff-filter=ACM origin/main...HEAD | grep '\.ts$')
        - name: Lint changed Markdown files
          run:
            npx markdownlint $(git diff --name-only --diff-filter=ACM origin/main...HEAD | grep
            '\.md$')
        - name: Validate Markdown sections
          run: npm run validate:md
        - run: npx tsc --noEmit
        - name: Generate tasks
          run: npx task-master-ai parse --prd .taskmaster/docs/prd.txt --output tasks/tasks.json
        - name: Security scan
          uses: snyk/actions/node@master
          env:
            SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
          with:
            command: test
  ```

- **Update `package.json`**:

  ```json
  {
    "scripts": {
      "lint": "eslint src/**/*.{ts,tsx}",
      "lint:md": "markdownlint README.md 'docs/*.md' 'docs/api/*.md'",
      "validate:md": "node scripts/validate-md-sections.js",
      "typecheck": "tsc --noEmit",
      "validate": "npm run lint && npm run lint:md && npm run validate:md && npm run typecheck",
      "tasks": "npx task-master-ai parse --prd .taskmaster/docs/prd.txt --output tasks/tasks.json"
    }
  }
  ```

- **Add CI Badge to `README.md`**:
  ```markdown
  ![Lint and TypeCheck](https://github.com/your-org/your-repo/actions/workflows/lint.yml/badge.svg)
  ```

**Purpose**: Enforces `.mdc` rules, generates tasks, and ensures security.

**Branch Protection**: Enable “Require status checks to pass” for the `lint` job in GitHub.

### 14. Optimize Cursor for AI Tasks

**Action**: Fine-tune Cursor settings for Taskmaster AI and `.mdc` enforcement.

- Enable autosave and select Claude 3.7 Sonnet or GPT-4 Turbo in Cursor settings.
- Enable “Strict Mode” for AI completions to respect `.mdc` rules.
- Create `.cursorignore`:
  ```
  node_modules
  dist
  coverage
  logs
  ```
- Create `.taskmasterignore`:
  ```
  node_modules
  dist
  coverage
  ```

**Purpose**: Reduces context overload and ensures AI compliance with `.mdc`.

### 15. Test the Setup

**Action**: Verify `.mdc` rules and Taskmaster AI task generation.

- **Test `.mdc` Rules**:

  - TypeScript:
    ```typescript
    // Bad code
    function process(data: any) {
      return data.value;
    }
    ```
    - Cursor flags: `@typescript-eslint/no-explicit-any: error`.
    - Fix:
      ```typescript
      /** Processes input data */
      function process(data: { value: string }): string {
        return data.value;
      }
      ```
  - Markdown:

    ```markdown
    # My Project

    ## Purpose

    A TypeScript app.
    ```

    - Run `npm run lint:md` and `npm run validate:md` to flag missing sections.
    - Fix:

      ````markdown
      # My Project

      ## Purpose

      A TypeScript application for user management.

      ## Usage

      ```bash
      npm install
      npm start
      ```
      ````

      ## Examples

      ```typescript
      const user = await fetchUser('123');
      console.log(user.name); // "Alice"
      ```

      ```

      ```

- **Test Taskmaster AI**:
  - Run:
    ```bash
    npx task-master-ai parse --prd .taskmaster/docs/prd.txt --output tasks/tasks.json
    ```
  - Verify `/tasks/tasks.json` is generated with tasks like:
    ```json
    [
      {
        "id": "task_001",
        "description": "Implement login endpoint with email/password",
        "file": "src/auth/login.ts"
      }
    ]
    ```
  - Commit tasks to Git:
    ```bash
    git add tasks/tasks.json
    git commit -m "feat: generate initial tasks from PRD"
    ```

**Purpose**: Confirms `.mdc` enforcement and Taskmaster AI functionality.

### 16. Validate Compliance

**Action**: Create a validation script for `.mdc` and tasks.

```javascript
// scripts/validate-mdc.js
const { execSync } = require('child_process');

function validateMDC() {
  console.log('Validating .mdc rules and tasks...');
  try {
    execSync('npm run validate', { stdio: 'inherit' });
    execSync('npx task-master-ai validate --tasks tasks/tasks.json', { stdio: 'inherit' });
    console.log('Validation successful');
  } catch (error) {
    console.error('Validation failed:', error.message);
    process.exit(1);
  }
}

validateMDC();
```

**Update `package.json`**:

```json
{
  "scripts": {
    "validate:mdc": "node scripts/validate-mdc.js"
  }
}
```

**Run**: `npm run validate:mdc`

**Purpose**: Ensures `.mdc` rules and task generation are correct.

### 17. Educate Your Team

**Action**: Document standards in `CONTRIBUTING.md`.

```markdown
# Contributing

## Coding Standards

- `.cursor/` enforces TypeScript and Markdown rules:
  - No `any` types; use `unknown`.
  - TSDoc comments for public APIs.
  - Markdown requires `Purpose`, `Usage`, `Examples`.
- Taskmaster AI generates tasks from `.taskmaster/docs/prd.txt`.

## Setup

1. Use Node.js 20 (`nvm use`).
2. Install: `npm ci`.
3. Install Cursor extensions: `cursor.extensions.eslint`, `cursor.extensions.prettier`,
   `cursor.extensions.markdownlint`.
4. Run `npm run validate` before committing.

## CI

PRs must pass `lint.yml` checks.

## Code Review Checklist

- Code complies with `.mdc` rules.
- Markdown includes required sections.
- Tasks in `tasks/tasks.json` align with PRD.
- Security warnings have mitigation comments.

## Cross-Platform

- **Windows/Linux**: Use `Ctrl + ,` for settings. Use `npx markdownlint`.

## Onboarding

- Review `.cursor/` and `.taskmaster/` configs.
- Test with `npm run validate` and `task-master list`.
```

**Purpose**: Aligns team on standards and workflows.

### 18. Maintain the Setup

**Action**: Review configurations quarterly.

- Update `.mdc`, `.eslintrc.json`, `.prettierrc`, `.markdownlintrc`, and Taskmaster AI settings.
- Run `npm outdated` to update dependencies.
- Document in `CHANGELOG.md`:
  ```markdown
  # Changelog

  ## [1.1.0] - 2025-06-18

  - Added `.mdc` rule: `require-jsdoc-for-private` (warning).
  - Updated Taskmaster AI to parse new PRD sections.
  ```

**Purpose**: Keeps the setup current.

### 19. Migrate Existing Codebases

**Action**: Gradually adopt `.mdc` and Taskmaster AI.

- Run `npm run lint -- --fix` and `npm run tasks`.
- Use `@ts-ignore` for unfixable errors, with a resolution plan.
- Update Markdown files incrementally.
- Migrate PRD to `.taskmaster/docs/prd.txt` with `task-master migrate`.

**Purpose**: Ensures smooth integration.

## Additional Notes

### Schema Validation for `.mdc`

**Action**: Validate `.mdc` files.

- **Install**:

  ```bash
  npm install --save-dev ajv@8.12.0 ajv-cli@5.0.0
  ```

- **Create `cursor-mdc.schema.json`**:

  ```json
  {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
      "version": { "type": "number" },
      "metadata": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "description": { "type": "string" },
          "lastUpdated": { "type": "string" },
          "strictnessLevel": { "type": "string" }
        }
      },
      "rules": { "type": "object" }
    }
  }
  ```

- **Create `scripts/validate-mdc-schema.js`**:

  ```javascript
  const Ajv = require('ajv');
  const fs = require('fs');

  const ajv = new Ajv();
  const schema = JSON.parse(fs.readFileSync('cursor-mdc.schema.json', 'utf8'));
  const files = ['.cursor/index.mdc', '.cursor/rules/typescript.mdc', '.cursor/rules/docs.mdc'];

  files.forEach(file => {
    const mdc = JSON.parse(fs.readFileSync(file, 'utf8').split('---')[2]);
    if (ajv.validate(schema, mdc)) {
      console.log(`${file} is valid`);
    } else {
      console.error(`${file} is invalid:`, ajv.errors);
      process.exit(1);
    }
  });
  ```

- **Update `package.json`**:
  ```json
  {
    "scripts": {
      "validate:mdc-schema": "node scripts/validate-mdc-schema.js"
    }
  }
  ```

**Run**: `npm run validate:mdc-schema`

### Context Anchoring for Taskmaster AI

- **Create `taskmaster_prep.md`**:

  ```markdown
  # Taskmaster AI Prep

  ## Out-of-Scope

  - Legacy backend integration
  - UI redesign

  ## Key Dependencies

  - TypeScript, Express, Passport.js
  ```

- **Create `ARCHITECTURE.md`**:

  ```markdown
  # Architecture

  ## Patterns

  - REST API with Express
  - JWT-based authentication
  ```

**Purpose**: Reduces AI hallucinations by defining boundaries.

### Editor and Runtime Harmonizers

- **`.editorconfig`**:

  ```ini
  root = true
  [*]
  indent_style = space
  indent_size = 2
  end_of_line = lf
  charset = utf-8
  ```

- **`.nvmrc`**:

  ```
  20
  ```

- **`.github/CODEOWNERS`**:
  ```
  .cursor/* @tech-lead
  .taskmaster/* @tech-lead
  .github/workflows/* @devops
  ```

### Dependencies

```json
{
  "devDependencies": {
    "eslint": "8.57.0",
    "@typescript-eslint/parser": "6.21.0",
    "@typescript-eslint/eslint-plugin": "6.21.0",
    "eslint-plugin-import": "2.29.1",
    "eslint-plugin-security": "1.7.1",
    "eslint-plugin-jsx-a11y": "6.8.0",
    "eslint-plugin-tsdoc": "0.2.17",
    "eslint-plugin-simple-import-sort": "10.0.0",
    "eslint-config-prettier": "9.1.0",
    "prettier": "3.2.5",
    "prettier-plugin-md": "0.1.0",
    "markdownlint": "0.26.2",
    "markdownlint-cli": "0.32.2",
    "markdown-section-validator": "1.0.0",
    "typescript": "5.4.5",
    "husky": "9.0.11",
    "lint-staged": "15.2.0",
    "@commitlint/config-conventional": "19.0.3",
    "@commitlint/cli": "19.0.3",
    "typedoc": "0.26.0",
    "typedoc-plugin-markdown": "4.0.0",
    "ajv": "8.12.0",
    "ajv-cli": "5.0.0",
    "task-master-ai": "latest"
  },
  "engines": { "node": "20" }
}
```

### Alternative IDEs

- **VS Code**:
  - Extensions: `dbaeumer.vscode-eslint`, `esbenp.prettier-vscode`,
    `davidanson.vscode-markdownlint`.
  - Settings:
    ```json
    {
      "editor.defaultFormatter": "esbenp.prettier-vscode",
      "editor.formatOnSave": true,
      "eslint.validate": ["javascript", "typescript"],
      "[markdown]": { "editor.defaultFormatter": "DavidAnson.vscode-markdownlint" }
    }
    ```

### Troubleshooting

- **ESLint Errors**: Verify `.eslintrc.json` and extension activation.
- **TypeScript Paths**: Check `tsconfig.json`’s `baseUrl` and `paths`.
- **Markdown Issues**: Adjust `.markdownlintrc` for false positives.
- **AI Violations**: Enable “Strict Mode” or disable inline completions
  (`Ctrl+Shift+P > Toggle Inline Suggestions`).
- **Taskmaster AI**: Run `task-master list` to verify API keys and MCP server.
- **CI Failures**: Check GitHub Actions logs.

### Monitoring and Metrics

- Track `.mdc` violations and task generation in CI logs.
- Add test coverage (e.g., Jest with `"coverageThreshold": { "global": { "lines": 80 } }`).

## Next Steps

- **Code**: Write TypeScript with Cursor’s AI and linting.
- **Generate Tasks**: Run `npm run tasks` to create tasks from PRD.
- **Document**: Update `README.md`, `docs/*.md`, and `docs/api/*.md`.
- **Commit**: Run `npm run validate` before committing.
- **Monitor**: Review violations and update configs quarterly.
- **Onboard**: Share `CONTRIBUTING.md` with team.

## Validation Checklist

- [ ] Clean repository with `.gitignore`
- [ ] `.cursor/` with `index.mdc` and `rules/*.mdc`
- [ ] `.taskmaster/docs/prd.txt` with detailed PRD
- [ ] Taskmaster AI initialized and MCP server running
- [ ] Husky pre-commit and commit-msg hooks
- [ ] TypeDoc for API docs
- [ ] `.editorconfig`, `.nvmrc`, `CODEOWNERS`
- [ ] CI with caching, Snyk, and task generation
- [ ] Tasks committed to `tasks/tasks.json`

This setup ensures **excellence** in TypeScript development and PRD task breakdown, leveraging
Cursor’s AI and Taskmaster AI for a scalable, team-friendly workflow.
