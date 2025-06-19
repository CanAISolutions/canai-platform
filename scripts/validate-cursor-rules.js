#!/usr/bin/env node

/**
 * CanAI Platform Cursor Rules Validation Script
 * Based on Cursor Setup Guide Best Practices
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_RULES = [
  'canai-typescript-rules',
  'canai-structure-rules',
  'canai-cortex-rules',
  'canai-api-rules',
  'canai-supabase-rules',
  'canai-user-journey',
  'canai-analytics-rules',
  'canai-security-rules',
  'canai-testing-rules',
];

const CURSOR_CONFIG_PATH = '.cursor.config.json';
const CURSOR_RULES_DIR = '.cursor/rules';

function validateCursorConfig() {
  console.log('🎯 Validating Cursor configuration...');

  // Check if cursor config exists
  if (!fs.existsSync(CURSOR_CONFIG_PATH)) {
    console.error('❌ Cursor config not found:', CURSOR_CONFIG_PATH);
    return false;
  }

  try {
    const config = JSON.parse(fs.readFileSync(CURSOR_CONFIG_PATH, 'utf8'));
    console.log('✅ Cursor config is valid JSON');

    // Check for required rules
    const configStr = JSON.stringify(config);
    const missing = REQUIRED_RULES.filter(rule => !configStr.includes(rule));

    if (missing.length > 0) {
      console.error('❌ Missing required rules:', missing.join(', '));
      return false;
    }

    console.log('✅ All required rules are configured');
    return true;
  } catch (error) {
    console.error('❌ Invalid Cursor config JSON:', error.message);
    return false;
  }
}

function validateRuleFiles() {
  console.log('📁 Validating rule files...');

  if (!fs.existsSync(CURSOR_RULES_DIR)) {
    console.error('❌ Cursor rules directory not found:', CURSOR_RULES_DIR);
    return false;
  }

  const ruleFiles = fs
    .readdirSync(CURSOR_RULES_DIR)
    .filter(file => file.endsWith('.mdc'));

  if (ruleFiles.length === 0) {
    console.error('❌ No .mdc rule files found in', CURSOR_RULES_DIR);
    return false;
  }

  console.log(`✅ Found ${ruleFiles.length} rule files`);

  // Validate each rule file has proper structure
  let allValid = true;
  for (const file of ruleFiles) {
    const filePath = path.join(CURSOR_RULES_DIR, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Check for YAML front matter
      if (!content.startsWith('---')) {
        console.warn(`⚠️  ${file}: Missing YAML front matter`);
      }

      // Check for JSON configuration
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        JSON.parse(jsonMatch[0]);
        console.log(`✅ ${file}: Valid configuration`);
      } else {
        console.warn(`⚠️  ${file}: No JSON configuration found`);
      }
    } catch (error) {
      console.error(`❌ ${file}: Invalid configuration -`, error.message);
      allValid = false;
    }
  }

  return allValid;
}

function validateTypeScriptIntegration() {
  console.log('🔗 Validating TypeScript integration...');

  // Check tsconfig.json for strict settings
  const tsconfigPath = 'tsconfig.json';
  if (!fs.existsSync(tsconfigPath)) {
    console.error('❌ tsconfig.json not found');
    return false;
  }

  try {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    const compilerOptions = tsconfig.compilerOptions || {};

    const requiredOptions = {
      strict: true,
      strictNullChecks: true,
      noUncheckedIndexedAccess: true,
      exactOptionalPropertyTypes: true,
    };

    let allSet = true;
    for (const [option, expected] of Object.entries(requiredOptions)) {
      if (compilerOptions[option] !== expected) {
        console.error(`❌ TypeScript option ${option} should be ${expected}`);
        allSet = false;
      }
    }

    if (allSet) {
      console.log('✅ TypeScript strict mode properly configured');
    }

    return allSet;
  } catch (error) {
    console.error('❌ Invalid tsconfig.json:', error.message);
    return false;
  }
}

function validateESLintIntegration() {
  console.log('🧹 Validating ESLint integration...');

  const eslintPath = 'eslint-preset.js';
  if (!fs.existsSync(eslintPath)) {
    console.error('❌ ESLint preset not found:', eslintPath);
    return false;
  }

  try {
    const eslintConfig = require(path.resolve(eslintPath));

    // Check for TypeScript rules
    const rules = eslintConfig.rules || {};
    const hasTypeScriptRules = Object.keys(rules).some(rule =>
      rule.startsWith('@typescript-eslint/')
    );

    if (hasTypeScriptRules) {
      console.log('✅ ESLint TypeScript integration configured');
      return true;
    } else {
      console.error('❌ ESLint missing TypeScript rules');
      return false;
    }
  } catch (error) {
    console.error('❌ Invalid ESLint configuration:', error.message);
    return false;
  }
}

function main() {
  console.log('🚀 CanAI Platform Cursor Rules Validation\n');

  const validations = [
    validateCursorConfig,
    validateRuleFiles,
    validateTypeScriptIntegration,
    validateESLintIntegration,
  ];

  let allPassed = true;
  for (const validate of validations) {
    const passed = validate();
    allPassed = allPassed && passed;
    console.log('');
  }

  if (allPassed) {
    console.log('🎉 All validations passed! Cursor setup is optimal.');
    process.exit(0);
  } else {
    console.log('❌ Some validations failed. Please fix the issues above.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  validateCursorConfig,
  validateRuleFiles,
  validateTypeScriptIntegration,
  validateESLintIntegration,
};
