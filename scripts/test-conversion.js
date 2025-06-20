#!/usr/bin/env node

const fs = require('fs');

console.log('🔍 Testing conversion process...');

try {
  // Test 1: Read file
  console.log('📖 Reading taskmaster_tasks.md...');
  const content = fs.readFileSync('taskmaster_tasks.md', 'utf8');
  console.log(`✅ File read successfully (${content.length} chars)`);

  // Test 2: Find first section
  console.log('🔍 Looking for Section 6.1...');
  const sectionRegex = /## Section (6\.1): ([^\n]+)\n\n```yaml\n([\s\S]*?)\n```/g;
  const match = sectionRegex.exec(content);

  if (match) {
    const [, sectionId, sectionTitle, yamlContent] = match;
    console.log(`✅ Found: ${sectionId} - ${sectionTitle}`);
    console.log(`📄 YAML content length: ${yamlContent.length}`);

    // Test 3: Parse YAML content
    console.log('🔍 Parsing YAML content...');
    const lines = yamlContent.split('\n');
    let taskCount = 0;

    for (const line of lines) {
      if (line.trim().startsWith('- id:')) {
        taskCount++;
      }
    }

    console.log(`✅ Found ${taskCount} tasks in section 6.1`);

    // Test 4: Check TaskMaster directory
    console.log('🔍 Checking TaskMaster structure...');
    if (fs.existsSync('.taskmaster')) {
      console.log('✅ .taskmaster directory exists');
      if (fs.existsSync('.taskmaster/tasks')) {
        console.log('✅ .taskmaster/tasks directory exists');
      } else {
        console.log('⚠️  .taskmaster/tasks directory missing - will create');
      }
    } else {
      console.log('⚠️  .taskmaster directory missing - will create');
    }

    console.log('🎉 All tests passed! Ready to convert.');

  } else {
    console.log('❌ Section 6.1 not found');
  }

} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error(error.stack);
}
