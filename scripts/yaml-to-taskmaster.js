#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Converts YAML task format from taskmaster_tasks.md to TaskMaster JSON
 */
class YAMLToTaskMaster {
  constructor() {
    this.taskCounter = 1;
    this.taskMap = new Map();
    this.convertedTasks = [];
  }

  parseYAMLSection(yamlText) {
    const tasks = [];
    const lines = yamlText.split('\n');
    let currentTask = null;
    let currentField = null;
    let indentLevel = 0;

    for (let line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      // Detect task start
      if (line.match(/^\s*- id:/)) {
        if (currentTask) tasks.push(currentTask);
        currentTask = { dependencies: [] };
        currentField = null;
      }

      // Parse fields
      if (trimmed.startsWith('id:')) {
        currentTask.id = trimmed.replace('id:', '').trim();
      } else if (trimmed.startsWith('description:')) {
        currentTask.description = trimmed.replace('description:', '').trim();
      } else if (trimmed.startsWith('dependencies:')) {
        currentField = 'dependencies';
      } else if (trimmed.startsWith('inputs:')) {
        currentField = 'inputs';
        currentTask.inputs = [];
      } else if (trimmed.startsWith('outputs:')) {
        currentField = 'outputs';
        currentTask.outputs = [];
      } else if (trimmed.startsWith('cursor-ai-instructions:')) {
        currentField = 'instructions';
        currentTask.instructions = [];
      } else if (trimmed.startsWith('-') && currentField) {
        const value = trimmed.replace(/^-\s*/, '');
        if (currentField === 'dependencies') {
          currentTask.dependencies.push(value);
        } else if (currentField === 'inputs') {
          currentTask.inputs.push(value);
        } else if (currentField === 'outputs') {
          currentTask.outputs.push(value);
        } else if (currentField === 'instructions') {
          currentTask.instructions.push(value);
        }
      }
    }

    if (currentTask) tasks.push(currentTask);
    return tasks;
  }

  parseMarkdownFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const sections = [];

    // Find all YAML sections
    const yamlBlocks = content.split('```yaml');

    for (let i = 1; i < yamlBlocks.length; i++) {
      const block = yamlBlocks[i].split('```')[0];
      const prevText = yamlBlocks[i - 1];

      // Extract section info from previous text
      const sectionMatch = prevText.match(/## Section (\d+\.\d+): ([^\n]+)$/m);
      if (sectionMatch) {
        const [, sectionId, sectionTitle] = sectionMatch;
        const tasks = this.parseYAMLSection(block);

        if (tasks.length > 0) {
          sections.push({
            sectionId,
            sectionTitle,
            tasks,
          });
        }
      }
    }

    return sections;
  }

  convertTask(yamlTask, sectionTitle) {
    if (!yamlTask.id) {
      console.error('Found a task without an ID. Skipping.', yamlTask);
      return null;
    }
    const newId = this.taskCounter++;
    this.taskMap.set(yamlTask.id, newId);

    // Create clean title
    const title = yamlTask.id
      .replace(/^T\d+\.\d+\.\d+-/, '')
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Determine priority
    let priority = 'medium';
    if (
      yamlTask.description &&
      (yamlTask.description.toLowerCase().includes('critical') ||
        yamlTask.description.toLowerCase().includes('urgent') ||
        yamlTask.description.toLowerCase().includes('security'))
    ) {
      priority = 'high';
    }

    // Convert instructions to details
    const details = yamlTask.instructions
      ? yamlTask.instructions.map(inst => `- ${inst}`).join('\n')
      : 'Implementation details to be defined based on requirements.';

    // Create test strategy
    const testStrategy = yamlTask.outputs
      ? `Verify outputs:\n${yamlTask.outputs
          .map(output => `- ${output}`)
          .join('\n')}`
      : 'Test implementation meets requirements and integrates properly.';

    return {
      id: newId,
      title,
      description: yamlTask.description || 'Task description to be defined.',
      status: 'pending',
      priority,
      dependencies: [], // Will be filled in second pass
      details,
      testStrategy,
      subtasks: [],
      metadata: {
        originalId: yamlTask.id,
        section: sectionTitle,
        inputs: yamlTask.inputs || [],
        outputs: yamlTask.outputs || [],
      },
    };
  }

  convertAll(sections) {
    console.log(`Processing ${sections.length} sections...`);

    // First pass: create all tasks
    for (const section of sections) {
      console.log(
        `- Section ${section.sectionId}: ${section.tasks.length} tasks`
      );
      for (const yamlTask of section.tasks) {
        const converted = this.convertTask(yamlTask, section.sectionTitle);
        if (converted) {
          this.convertedTasks.push(converted);
        }
      }
    }

    // Second pass: resolve dependencies
    for (const section of sections) {
      for (const yamlTask of section.tasks) {
        const converted = this.convertedTasks.find(
          t => t.metadata.originalId === yamlTask.id
        );
        if (converted && yamlTask.dependencies) {
          converted.dependencies = yamlTask.dependencies
            .map(dep => this.taskMap.get(dep))
            .filter(id => id !== undefined);
        }
      }
    }

    return this.convertedTasks;
  }

  generateTaskMasterJSON(tasks) {
    return {
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
        conversionTool: 'yaml-to-taskmaster.js',
      },
    };
  }

  convert(inputFile, outputFile) {
    console.log('🔄 Converting YAML tasks to TaskMaster format...');

    if (!fs.existsSync(inputFile)) {
      throw new Error(`Input file not found: ${inputFile}`);
    }

    // Parse markdown file
    const sections = this.parseMarkdownFile(inputFile);
    console.log(`📖 Found ${sections.length} sections`);

    // Convert all tasks
    const tasks = this.convertAll(sections);
    console.log(`✅ Converted ${tasks.length} tasks`);

    // Generate TaskMaster JSON
    const taskMasterData = this.generateTaskMasterJSON(tasks);

    // Ensure output directory exists
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write output
    fs.writeFileSync(outputFile, JSON.stringify(taskMasterData, null, 2));
    console.log(`💾 Saved to: ${outputFile}`);

    // Generate report
    this.generateReport(tasks, sections);

    return taskMasterData;
  }

  generateReport(tasks, sections) {
    const report = {
      conversion: {
        date: new Date().toISOString(),
        totalSections: sections.length,
        totalTasks: tasks.length,
        success: true,
      },
      taskBreakdown: {
        byPriority: {
          high: tasks.filter(t => t.priority === 'high').length,
          medium: tasks.filter(t => t.priority === 'medium').length,
          low: tasks.filter(t => t.priority === 'low').length,
        },
        withDependencies: tasks.filter(t => t.dependencies.length > 0).length,
        withoutDependencies: tasks.filter(t => t.dependencies.length === 0)
          .length,
      },
      sections: sections.map(s => ({
        id: s.sectionId,
        title: s.sectionTitle,
        taskCount: s.tasks.length,
      })),
      dependencyValidation: this.validateDependencies(tasks),
    };

    fs.writeFileSync(
      'taskmaster-conversion-report.json',
      JSON.stringify(report, null, 2)
    );
    console.log('📊 Generated report: taskmaster-conversion-report.json');

    if (!report.dependencyValidation.valid) {
      console.warn(
        `⚠️  Found ${report.dependencyValidation.issues.length} dependency issues`
      );
    }
  }

  validateDependencies(tasks) {
    const taskIds = new Set(tasks.map(t => t.id));
    const issues = [];

    for (const task of tasks) {
      for (const depId of task.dependencies) {
        if (!taskIds.has(depId)) {
          issues.push({
            taskId: task.id,
            taskTitle: task.title,
            missingDependency: depId,
            originalId: task.metadata.originalId,
          });
        }
      }
    }

    return { valid: issues.length === 0, issues };
  }
}

// CLI execution
if (require.main === module) {
  console.log('Script execution started.');
  const converter = new YAMLToTaskMaster();

  const inputFile = process.argv[2] || 'taskmaster_tasks.md';
  const outputFile = process.argv[3] || '.taskmaster/tasks/tasks.json';

  console.log(`Input file: ${inputFile}`);
  console.log(`Output file: ${outputFile}`);

  try {
    console.log('Entering try block.');
    converter.convert(inputFile, outputFile);
    console.log('\n🎉 Conversion completed!');
    console.log('\nNext steps:');
    console.log('1. Review tasks.json and conversion report');
    console.log('2. Run: task-master list');
    console.log('3. Start with: task-master next');
  } catch (error) {
    console.error('\n❌ Conversion script caught an error:');
    console.error(error);
    process.exit(1);
  }
}

module.exports = YAMLToTaskMaster;
