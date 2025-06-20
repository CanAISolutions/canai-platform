#!/usr/bin/env node

/**
 * TaskMaster Validation Script for CanAI Platform
 *
 * This script validates that TaskMaster is properly configured and working
 * with the CanAI Emotional Sovereignty Platform.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 TaskMaster Setup Validation for CanAI Platform\n');

// Check if we're in the right directory
const projectRoot = process.cwd();
const requiredFiles = [
  '.taskmaster/config.json',
  'tasks/tasks.json',
  '.taskmaster/docs/prd.txt',
  '.cursor/mcp.json'
];

console.log('📁 Checking project structure...');
let structureValid = true;

requiredFiles.forEach(file => {
  const filePath = path.join(projectRoot, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file} - Found`);
  } else {
    console.log(`  ❌ ${file} - Missing`);
    structureValid = false;
  }
});

if (!structureValid) {
  console.log('\n❌ Project structure incomplete. Please ensure all required files exist.');
  process.exit(1);
}

// Check API keys
console.log('\n🔑 Checking API keys...');
const requiredKeys = ['ANTHROPIC_API_KEY', 'PERPLEXITY_API_KEY'];
const optionalKeys = ['OPENAI_API_KEY', 'GOOGLE_API_KEY'];

let apiKeysValid = true;

requiredKeys.forEach(key => {
  if (process.env[key]) {
    console.log(`  ✅ ${key} - Configured`);
  } else {
    console.log(`  ❌ ${key} - Missing (Required)`);
    apiKeysValid = false;
  }
});

optionalKeys.forEach(key => {
  if (process.env[key]) {
    console.log(`  ✅ ${key} - Configured (Optional)`);
  } else {
    console.log(`  ⚠️  ${key} - Not configured (Optional)`);
  }
});

// Check TaskMaster installation
console.log('\n📦 Checking TaskMaster installation...');
try {
  const version = execSync('npx task-master-ai --version', { encoding: 'utf8', stdio: 'pipe' });
  console.log(`  ✅ TaskMaster AI installed - Version: ${version.trim()}`);
} catch (error) {
  console.log('  ❌ TaskMaster AI not installed or not accessible');
  console.log('  💡 Try running: npm install -g task-master-ai');
  process.exit(1);
}

// Validate tasks.json format
console.log('\n📋 Validating tasks.json format...');
try {
  const tasksPath = path.join(projectRoot, 'tasks/tasks.json');
  const tasksContent = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));

  if (tasksContent.tasks && Array.isArray(tasksContent.tasks)) {
    console.log(`  ✅ tasks.json format valid - ${tasksContent.tasks.length} tasks found`);

    // Check for required task fields
    const requiredFields = ['id', 'title', 'description', 'priority', 'status'];
    let tasksValid = true;

    tasksContent.tasks.forEach((task, index) => {
      requiredFields.forEach(field => {
        if (!task[field]) {
          console.log(`  ❌ Task ${index + 1} missing required field: ${field}`);
          tasksValid = false;
        }
      });
    });

    if (tasksValid) {
      console.log('  ✅ All tasks have required fields');
    }
  } else {
    console.log('  ❌ tasks.json format invalid - missing tasks array');
    process.exit(1);
  }
} catch (error) {
  console.log('  ❌ Error reading or parsing tasks.json:', error.message);
  process.exit(1);
}

// Test TaskMaster commands (if API keys are available)
if (apiKeysValid) {
  console.log('\n🧪 Testing TaskMaster commands...');

  try {
    console.log('  Testing models command...');
    const modelsOutput = execSync('npx task-master-ai models', { encoding: 'utf8', stdio: 'pipe' });
    console.log('  ✅ Models command successful');
  } catch (error) {
    console.log('  ❌ Models command failed:', error.message);
  }

  try {
    console.log('  Testing get-tasks command...');
    const tasksOutput = execSync('npx task-master-ai get-tasks', { encoding: 'utf8', stdio: 'pipe' });
    console.log('  ✅ Get-tasks command successful');
  } catch (error) {
    console.log('  ❌ Get-tasks command failed:', error.message);
  }
} else {
  console.log('\n⚠️  Skipping TaskMaster command tests - API keys not configured');
}

// Summary
console.log('\n📊 Validation Summary:');
console.log('='.repeat(50));

if (structureValid && apiKeysValid) {
  console.log('✅ TaskMaster setup is ready for deployment!');
  console.log('\n🎯 Next steps:');
  console.log('1. Run: npx task-master-ai generate');
  console.log('2. Run: npx task-master-ai next-task');
  console.log('3. Start development with the identified task');
} else {
  console.log('❌ TaskMaster setup needs attention');
  console.log('\n🔧 Required actions:');

  if (!structureValid) {
    console.log('- Fix missing project files');
  }

  if (!apiKeysValid) {
    console.log('- Configure missing API keys');
    console.log('- Set ANTHROPIC_API_KEY environment variable');
    console.log('- Set PERPLEXITY_API_KEY environment variable');
  }

  console.log('\n📖 See TASKMASTER_SETUP.md for detailed instructions');
}

console.log('\n🔗 Useful resources:');
console.log('- Setup Guide: ./TASKMASTER_SETUP.md');
console.log('- Task Files: ./tasks/');
console.log('- Configuration: ./.taskmaster/config.json');
console.log('- PRD Document: ./.taskmaster/docs/prd.txt');
