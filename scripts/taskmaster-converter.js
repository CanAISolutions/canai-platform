#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Converting YAML tasks to TaskMaster format...');

function parseTasksFromMarkdown(content) {
  const sections = [];

  // Split content by sections - look for "## Section X.X:" pattern
  const sectionRegex =
    /## Section (\d+\.\d+): ([^\n]+)\n\n```yaml\n([\s\S]*?)\n```/g;
  let match;

  while ((match = sectionRegex.exec(content)) !== null) {
    const [, sectionId, sectionTitle, yamlContent] = match;
    console.log(`Found section: ${sectionId} - ${sectionTitle}`);

    const tasks = parseYAMLTasks(yamlContent);
    if (tasks.length > 0) {
      sections.push({ sectionId, sectionTitle, tasks });
      console.log(`  Parsed ${tasks.length} tasks`);
    }
  }

  return sections;
}

function parseYAMLTasks(yamlText) {
  const tasks = [];
  const lines = yamlText.split('\n');
  let currentTask = null;
  let currentField = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (line.match(/^\s*- id:/)) {
      if (currentTask) tasks.push(currentTask);
      currentTask = {
        dependencies: [],
        inputs: [],
        outputs: [],
        instructions: [],
      };
      currentField = null;
    }

    if (!currentTask) continue;

    if (trimmed.startsWith('id:')) {
      currentTask.id = trimmed.replace('id:', '').trim();
    } else if (trimmed.startsWith('description:')) {
      // Handle multi-line descriptions
      let description = trimmed.replace('description:', '').trim();
      currentTask.description = description;
      currentField = 'description';
    } else if (trimmed.startsWith('dependencies:')) {
      currentField = 'dependencies';
    } else if (trimmed.startsWith('inputs:')) {
      currentField = 'inputs';
    } else if (trimmed.startsWith('outputs:')) {
      currentField = 'outputs';
    } else if (trimmed.startsWith('cursor-ai-instructions:')) {
      currentField = 'instructions';
    } else if (trimmed.startsWith('-') && currentField) {
      const value = trimmed.replace(/^-\s*/, '');
      if (currentField === 'description') {
        // Continue multi-line description
        currentTask.description += ' ' + value;
      } else {
        currentTask[currentField].push(value);
      }
    } else if (
      currentField === 'description' &&
      trimmed &&
      !trimmed.startsWith('-')
    ) {
      // Continue multi-line description
      currentTask.description += ' ' + trimmed;
    }
  }

  if (currentTask) tasks.push(currentTask);
  return tasks;
}

function convertToTaskMaster(sections) {
  let taskCounter = 1;
  const taskMap = new Map();
  const convertedTasks = [];

  console.log('Converting tasks...');

  // First pass: convert tasks and build ID mapping
  for (const section of sections) {
    console.log(`Converting section: ${section.sectionTitle}`);
    for (const yamlTask of section.tasks) {
      const newId = taskCounter++;
      taskMap.set(yamlTask.id, newId);

      const title = yamlTask.id
        .replace(/^T\d+\.\d+\.\d+-/, '')
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      const priority =
        yamlTask.description &&
        (yamlTask.description.toLowerCase().includes('critical') ||
          yamlTask.description.toLowerCase().includes('urgent') ||
          yamlTask.description.toLowerCase().includes('security'))
          ? 'high'
          : 'medium';

      const details =
        yamlTask.instructions.length > 0
          ? yamlTask.instructions.map(inst => `- ${inst}`).join('\n')
          : 'Implementation details to be defined.';

      const testStrategy =
        yamlTask.outputs.length > 0
          ? `Verify outputs:\n${yamlTask.outputs
              .map(output => `- ${output}`)
              .join('\n')}`
          : 'Test implementation meets requirements.';

      convertedTasks.push({
        id: newId,
        title,
        description: yamlTask.description || 'Task description to be defined.',
        status: 'pending',
        priority,
        dependencies: [],
        details,
        testStrategy,
        subtasks: [],
        metadata: {
          originalId: yamlTask.id,
          section: section.sectionTitle,
          inputs: yamlTask.inputs,
          outputs: yamlTask.outputs,
        },
      });

      console.log(`  Converted: ${yamlTask.id} -> ${newId}: ${title}`);
    }
  }

  // Second pass: resolve dependencies
  console.log('Resolving dependencies...');
  for (const section of sections) {
    for (const yamlTask of section.tasks) {
      const converted = convertedTasks.find(
        t => t.metadata.originalId === yamlTask.id
      );
      if (converted) {
        converted.dependencies = yamlTask.dependencies
          .map(dep => {
            const mappedId = taskMap.get(dep);
            if (!mappedId) {
              console.warn(
                `  Warning: Dependency ${dep} not found for task ${yamlTask.id}`
              );
            }
            return mappedId;
          })
          .filter(id => id !== undefined);
      }
    }
  }

  return convertedTasks;
}

// Main execution
try {
  const inputFile = 'taskmaster_tasks.md';
  const outputFile = '.taskmaster/tasks/tasks.json';

  if (!fs.existsSync(inputFile)) {
    throw new Error(`Input file not found: ${inputFile}`);
  }

  console.log(`Reading from: ${inputFile}`);
  const content = fs.readFileSync(inputFile, 'utf8');

  console.log('Parsing sections...');
  const sections = parseTasksFromMarkdown(content);

  if (sections.length === 0) {
    throw new Error(
      'No sections found in the markdown file. Check the format.'
    );
  }

  console.log(`Found ${sections.length} sections`);
  const tasks = convertToTaskMaster(sections);
  console.log(`Converted ${tasks.length} tasks total`);

  const taskMasterData = {
    version: '1.0.0',
    project: {
      name: 'CanAI Platform Backend',
      description:
        'Backend development tasks for CanAI Emotional Sovereignty Platform',
      created: new Date().toISOString(),
    },
    tags: {
      master: {
        name: 'master',
        description: 'Main development tasks converted from YAML format',
        created: new Date().toISOString(),
        tasks: tasks,
      },
    },
    metadata: {
      totalTasks: tasks.length,
      convertedFrom: 'taskmaster_tasks.md',
      conversionDate: new Date().toISOString(),
    },
  };

  // Ensure output directory exists
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created directory: ${outputDir}`);
  }

  console.log('Writing JSON file...');
  fs.writeFileSync(outputFile, JSON.stringify(taskMasterData, null, 2));
  console.log(`💾 Successfully saved to: ${outputFile}`);

  // Verify the file was written
  if (fs.existsSync(outputFile)) {
    const stats = fs.statSync(outputFile);
    console.log(`✅ File verified: ${stats.size} bytes`);
  } else {
    throw new Error('File was not created successfully');
  }

  console.log(
    `✅ Converted ${tasks.length} tasks from ${sections.length} sections`
  );
  console.log('\n🎉 Conversion completed!');
  console.log('\nNext steps:');
  console.log('1. Run: task-master list');
  console.log('2. Start with: task-master next');
} catch (error) {
  console.error('❌ Conversion failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
