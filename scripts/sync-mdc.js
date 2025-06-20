#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Sync MDC rules to ESLint configuration
 * Reads .cursor/index.mdc and rule files to generate ESLint config
 */
function syncMDCToESLint() {
  try {
    console.log('🔄 Syncing MDC rules to ESLint configuration...');

    // Read main MDC config
    const indexMdcPath = '.cursor/index.mdc';
    if (!fs.existsSync(indexMdcPath)) {
      console.error('❌ .cursor/index.mdc not found');
      process.exit(1);
    }

    const indexMdcContent = fs.readFileSync(indexMdcPath, 'utf8');
    const parts = indexMdcContent.split('---');
    if (parts.length < 3) {
      console.error('❌ Invalid MDC format in .cursor/index.mdc');
      process.exit(1);
    }
    const indexMdcJson = JSON.parse(parts[2].trim());

    // Read TypeScript-specific rules
    const tsRulesPath = '.cursor/rules/canai-typescript-rules.mdc';
    let tsRules = {};
    if (fs.existsSync(tsRulesPath)) {
      const tsContent = fs.readFileSync(tsRulesPath, 'utf8');
      const tsParts = tsContent.split('---');
      if (tsParts.length >= 3) {
        try {
          const tsJson = JSON.parse(tsParts[2].trim());
          tsRules = tsJson.rules || {};
        } catch (e) {
          console.warn('⚠️  Could not parse TypeScript MDC rules, skipping...');
        }
      }
    }

    // Merge rules from index.mdc and TypeScript rules
    const mdcRules = {
      ...indexMdcJson.rules.typescript,
      ...(tsRules.typescript || {}),
      ...tsRules,
    };

    // Map MDC rules to ESLint rules
    const eslintRules = {
      // Core TypeScript rules
      '@typescript-eslint/no-explicit-any':
        mdcRules['no-explicit-any'] || 'error',
      '@typescript-eslint/explicit-function-return-type':
        mdcRules['explicit-function-return-type'] || 'error',
      '@typescript-eslint/no-unused-vars': mdcRules['no-unused-vars'] || [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/strict-null-checks': 'error',
      'prefer-const': mdcRules['prefer-const'] || 'error',
      'no-console': mdcRules['no-console'] || [
        'warn',
        { allow: ['error', 'warn'] },
      ],

      // React rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Import rules
      'import/no-default-export': mdcRules['no-default-export'] || 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // Security rules
      'security/detect-unsafe-regex':
        mdcRules['detect-unsafe-regex'] || 'error',
      'security/detect-sql-injection': 'error',
      'security/detect-xss': 'error',

      // Accessibility
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',

      // TSDoc
      'tsdoc/syntax': 'warn',
    };

    // Generate new ESLint config
    const eslintConfig = {
      root: true,
      env: {
        browser: true,
        node: true,
        es2021: true,
      },
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
        project: './tsconfig.json',
        ecmaFeatures: {
          jsx: true,
        },
      },
      plugins: [
        '@typescript-eslint',
        'react',
        'react-hooks',
        'import',
        'security',
        'jsx-a11y',
        'tsdoc',
        'simple-import-sort',
      ],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'plugin:security/recommended',
        'plugin:jsx-a11y/recommended',
        'prettier',
      ],
      settings: {
        react: {
          version: 'detect',
        },
        'import/resolver': {
          typescript: {
            alwaysTryTypes: true,
            project: './tsconfig.json',
          },
        },
      },
      rules: eslintRules,
      overrides: [
        {
          files: ['*.test.ts', '*.test.tsx', '*.spec.ts', '*.spec.tsx'],
          rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            'import/no-default-export': 'off',
          },
        },
        {
          files: ['vite.config.ts', 'vitest.config.ts'],
          rules: {
            'import/no-default-export': 'off',
          },
        },
      ],
    };

    // Write updated ESLint config
    fs.writeFileSync('.eslintrc.json', JSON.stringify(eslintConfig, null, 2));

    console.log('✅ ESLint configuration synced with MDC rules');
    console.log('📝 Updated .eslintrc.json');

    // Validate the sync
    console.log('\n🔍 Validation:');
    console.log(`- TypeScript rules: ${Object.keys(mdcRules).length} mapped`);
    console.log(
      `- ESLint rules: ${Object.keys(eslintRules).length} configured`
    );
    console.log(`- MDC last updated: ${indexMdcJson.metadata.lastUpdated}`);
  } catch (error) {
    console.error('❌ Error syncing MDC to ESLint:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  syncMDCToESLint();
}

module.exports = { syncMDCToESLint };
