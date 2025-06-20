#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Converting YAML tasks in manageable chunks...');

class ChunkedTaskConverter {
  constructor() {
    this.taskCounter = 1;
    this.taskMap = new Map();
    this.outputFile = '.taskmaster/tasks/tasks.json';
    this.processedSections = [];
  }

  parseTasksFromSection(content, targetSectionId) {
    const sectionRegex = new RegExp(`## Section (${targetSectionId}): ([^\\n]+)\\n\\n\`\`\`yaml\\n([\\s\\S]*?)\\n\`\`\``, 'g');
    const match = sectionRegex.exec(content);

    if (!match) {
      console.log(`❌ Section ${targetSectionId} not found`);
      return null;
    }

    const [, sectionId, sectionTitle, yamlContent] = match;
    console.log(`📖 Found section: ${sectionId} - ${sectionTitle}`);

    const tasks = this.parseYAMLTasks(yamlContent);
    return {
      sectionId,
      sectionTitle,
      tasks
    };
  }

  parseYAMLTasks(yamlText) {
    const tasks = [];
    const lines = yamlText.split('\n');
    let currentTask = null;
    let currentField = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      if (line.match(/^\s*- id:/)) {
        if (currentTask) tasks.push(currentTask);
        currentTask = { dependencies: [], inputs: [], outputs: [], instructions: [] };
        currentField = null;
      }

      if (!currentTask) continue;

      if (trimmed.startsWith('id:')) {
        currentTask.id = trimmed.replace('id:', '').trim();
      } else if (trimmed.startsWith('description:')) {
        currentTask.description = trimmed.replace('description:', '').trim();
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
          currentTask.description += ' ' + value;
        } else {
          currentTask[currentField].push(value);
        }
      } else if (currentField === 'description' && trimmed && !trimmed.startsWith('-')) {
        currentTask.description += ' ' + trimmed;
      }
    }

    if (currentTask) tasks.push(currentTask);
    return tasks;
  }

  convertSectionTasks(section) {
    const convertedTasks = [];

    for (const yamlTask of section.tasks) {
      const newId = this.taskCounter++;
      this.taskMap.set(yamlTask.id, newId);

      const title = yamlTask.id
        .replace(/^T\d+\.\d+\.\d+-/, '')
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      const priority = (yamlTask.description &&
        (yamlTask.description.toLowerCase().includes('critical') ||
         yamlTask.description.toLowerCase().includes('urgent') ||
         yamlTask.description.toLowerCase().includes('security'))) ? 'high' : 'medium';

      const details = yamlTask.instructions.length > 0
        ? yamlTask.instructions.map(inst => `- ${inst}`).join('\n')
        : 'Implementation details to be defined.';

      const testStrategy = yamlTask.outputs.length > 0
        ? `Verify outputs:\n${yamlTask.outputs.map(output => `- ${output}`).join('\n')}`
        : 'Test implementation meets requirements.';

      convertedTasks.push({
        id: newId,
        title,
        description: yamlTask.description || 'Task description to be defined.',
        status: 'pending',
        priority,
        dependencies: [], // Will be resolved later
        details,
        testStrategy,
        subtasks: [],
        metadata: {
          originalId: yamlTask.id,
          section: section.sectionTitle,
          inputs: yamlTask.inputs,
          outputs: yamlTask.outputs,
          originalDependencies: yamlTask.dependencies // Store for later resolution
        }
      });

      console.log(`  ✅ ${yamlTask.id} -> ${newId}: ${title}`);
    }

    return convertedTasks;
  }

  initializeTasksFile() {
    const initialData = {
      version: "1.0.0",
      project: {
        name: "CanAI Platform Backend",
        description: "Backend development tasks for CanAI Emotional Sovereignty Platform",
        created: new Date().toISOString()
      },
      tags: {
        master: {
          name: "master",
          description: "Main development tasks converted from YAML format",
          created: new Date().toISOString(),
          tasks: []
        }
      },
      metadata: {
        totalTasks: 0,
        convertedFrom: "taskmaster_tasks.md",
        conversionDate: new Date().toISOString(),
        processedSections: []
      }
    };

    const outputDir = path.dirname(this.outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(this.outputFile, JSON.stringify(initialData, null, 2));
    console.log(`📝 Initialized ${this.outputFile}`);
  }

  appendTasksToFile(newTasks, sectionInfo) {
    try {
      const data = JSON.parse(fs.readFileSync(this.outputFile, 'utf8'));

      // Add new tasks
      data.tags.master.tasks.push(...newTasks);

      // Update metadata
      data.metadata.totalTasks = data.tags.master.tasks.length;
      data.metadata.processedSections.push({
        sectionId: sectionInfo.sectionId,
        sectionTitle: sectionInfo.sectionTitle,
        taskCount: newTasks.length,
        processedAt: new Date().toISOString()
      });

      fs.writeFileSync(this.outputFile, JSON.stringify(data, null, 2));
      console.log(`💾 Added ${newTasks.length} tasks from section ${sectionInfo.sectionId}`);
      console.log(`📊 Total tasks now: ${data.metadata.totalTasks}`);

      return true;
    } catch (error) {
      console.error(`❌ Failed to append tasks: ${error.message}`);
      return false;
    }
  }

  resolveDependencies() {
    try {
      const data = JSON.parse(fs.readFileSync(this.outputFile, 'utf8'));
      let resolvedCount = 0;

      for (const task of data.tags.master.tasks) {
        if (task.metadata.originalDependencies) {
          task.dependencies = task.metadata.originalDependencies
            .map(dep => this.taskMap.get(dep))
            .filter(id => id !== undefined);

          if (task.dependencies.length > 0) {
            resolvedCount++;
          }
        }
      }

      fs.writeFileSync(this.outputFile, JSON.stringify(data, null, 2));
      console.log(`🔗 Resolved dependencies for ${resolvedCount} tasks`);

      return true;
    } catch (error) {
      console.error(`❌ Failed to resolve dependencies: ${error.message}`);
      return false;
    }
  }

  processSection(content, sectionId) {
    console.log(`\n🔄 Processing section ${sectionId}...`);

    const section = this.parseTasksFromSection(content, sectionId);
    if (!section) return false;

    const convertedTasks = this.convertSectionTasks(section);
    if (convertedTasks.length === 0) return false;

    return this.appendTasksToFile(convertedTasks, section);
  }
}

// Main execution
async function main() {
  const converter = new ChunkedTaskConverter();
  const inputFile = 'taskmaster_tasks.md';

  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Input file not found: ${inputFile}`);
    process.exit(1);
  }

  console.log(`📖 Reading ${inputFile}...`);
  const content = fs.readFileSync(inputFile, 'utf8');

  // Initialize the tasks file
  converter.initializeTasksFile();

  // Define sections to process (you can adjust this list)
  const sectionsToProcess = [
    '6.1', '6.2', '6.3', '6.4', '6.5'  // Start with first 5 sections
  ];

  console.log(`\n🎯 Processing ${sectionsToProcess.length} sections...`);

  let successCount = 0;
  for (const sectionId of sectionsToProcess) {
    if (converter.processSection(content, sectionId)) {
      successCount++;
    }

    // Small delay to prevent any potential issues
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  if (successCount > 0) {
    console.log(`\n🔗 Resolving dependencies...`);
    converter.resolveDependencies();
  }

  console.log(`\n🎉 Conversion completed!`);
  console.log(`✅ Successfully processed ${successCount}/${sectionsToProcess.length} sections`);
  console.log('\nNext steps:');
  console.log('1. Check the generated tasks.json file');
  console.log('2. Run more sections by updating sectionsToProcess array');
  console.log('3. Use: task-master list');
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Conversion failed:', error.message);
    process.exit(1);
  });
}

module.exports = ChunkedTaskConverter;
