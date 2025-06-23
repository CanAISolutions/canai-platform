#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Converts the YAML task format from taskmaster_tasks.md to TaskMaster JSON format
 */
class TaskMasterConverter {
  constructor() {
    this.taskCounter = 1;
    this.taskMap = new Map(); // Maps old IDs to new numeric IDs
    this.convertedTasks = [];
  }

  /**
   * Parse the markdown file and extract YAML sections
   */
  parseMarkdownFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const sections = [];

    // Split by sections (## Section X.X:)
    const sectionRegex =
      /## Section (\d+\.\d+): ([^\n]+)\n\n```yaml\n([\s\S]*?)\n```/g;
    let match;

    while ((match = sectionRegex.exec(content)) !== null) {
      const [, sectionId, sectionTitle, yamlContent] = match;
      try {
        const parsedYaml = yaml.load(yamlContent);
        sections.push({
          sectionId,
          sectionTitle,
          tasks: parsedYaml.tasks || [],
        });
      } catch (error) {
        console.warn(
          `Failed to parse YAML in section ${sectionId}:`,
          error.message
        );
      }
    }

    return sections;
  }

  /**
   * Convert YAML task to TaskMaster format
   */
  convertTask(yamlTask, sectionTitle) {
    const newId = this.taskCounter++;
    this.taskMap.set(yamlTask.id, newId);

    // Extract priority from description or default to medium
    let priority = 'medium';
    if (
      yamlTask.description.toLowerCase().includes('critical') ||
      yamlTask.description.toLowerCase().includes('urgent')
    ) {
      priority = 'high';
    }

    // Convert dependencies from string IDs to numeric IDs
    const dependencies = (yamlTask.dependencies || [])
      .map(dep => this.taskMap.get(dep))
      .filter(id => id !== undefined);

    // Create title from ID and description
    const title = yamlTask.id
      .replace(/^T\d+\.\d+\.\d+-/, '')
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Convert cursor-ai-instructions to implementation details
    const details = yamlTask['cursor-ai-instructions']
      ? yamlTask['cursor-ai-instructions']
          .map(instruction => `- ${instruction}`)
          .join('\n')
      : 'Implementation details to be defined.';

    // Create test strategy from outputs
    const testStrategy = yamlTask.outputs
      ? `Verify the following outputs:\n${yamlTask.outputs
          .map(output => `- ${output}`)
          .join('\n')}`
      : 'Test implementation meets requirements and integrates properly.';

    return {
      id: newId,
      title,
      description: yamlTask.description,
      status: 'pending',
      priority,
      dependencies,
      details,
      testStrategy,
      subtasks: [],
      // Keep original metadata for reference
      metadata: {
        originalId: yamlTask.id,
        section: sectionTitle,
        inputs: yamlTask.inputs || [],
        outputs: yamlTask.outputs || [],
      },
    };
  }

  /**
   * Process all sections and convert tasks
   */
  convertAll(sections) {
    // First pass: convert all tasks to establish ID mapping
    for (const section of sections) {
      for (const task of section.tasks) {
        const convertedTask = this.convertTask(task, section.sectionTitle);
        this.convertedTasks.push(convertedTask);
      }
    }

    // Second pass: update dependencies with correct numeric IDs
    for (const section of sections) {
      for (let i = 0; i < section.tasks.length; i++) {
        const yamlTask = section.tasks[i];
        const convertedTask = this.convertedTasks.find(
          t => t.metadata.originalId === yamlTask.id
        );

        if (convertedTask && yamlTask.dependencies) {
          convertedTask.dependencies = yamlTask.dependencies
            .map(dep => this.taskMap.get(dep))
            .filter(id => id !== undefined);
        }
      }
    }

    return this.convertedTasks;
  }

  /**
   * Generate TaskMaster-compatible JSON structure
   */
  generateTaskMasterJSON(tasks) {
    return {
      version: '1.0.0',
      project: {
        name: 'CanAI Platform Backend',
        description:
          'Backend development tasks for the CanAI Emotional Sovereignty Platform',
        created: new Date().toISOString(),
      },
      tags: {
        master: {
          name: 'master',
          description: 'Main development tasks',
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
  }

  /**
   * Main conversion function
   */
  convert(inputFile, outputFile) {
    console.log('🔄 Converting TaskMaster tasks...');

    try {
      // Parse the markdown file
      const sections = this.parseMarkdownFile(inputFile);
      console.log(`📖 Found ${sections.length} sections with tasks`);

      // Convert all tasks
      const convertedTasks = this.convertAll(sections);
      console.log(`✅ Converted ${convertedTasks.length} tasks`);

      // Generate TaskMaster JSON
      const taskMasterData = this.generateTaskMasterJSON(convertedTasks);

      // Write to output file
      fs.writeFileSync(outputFile, JSON.stringify(taskMasterData, null, 2));
      console.log(`💾 Saved TaskMaster-compatible JSON to ${outputFile}`);

      // Generate summary report
      this.generateReport(convertedTasks, sections);

      return taskMasterData;
    } catch (error) {
      console.error('❌ Conversion failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate conversion report
   */
  generateReport(tasks, sections) {
    const report = {
      summary: {
        totalSections: sections.length,
        totalTasks: tasks.length,
        tasksByPriority: {
          high: tasks.filter(t => t.priority === 'high').length,
          medium: tasks.filter(t => t.priority === 'medium').length,
          low: tasks.filter(t => t.priority === 'low').length,
        },
        tasksWithDependencies: tasks.filter(t => t.dependencies.length > 0)
          .length,
      },
      sections: sections.map(section => ({
        id: section.sectionId,
        title: section.sectionTitle,
        taskCount: section.tasks.length,
      })),
      dependencyValidation: this.validateDependencies(tasks),
    };

    fs.writeFileSync('conversion-report.json', JSON.stringify(report, null, 2));
    console.log('📊 Generated conversion report: conversion-report.json');
  }

  /**
   * Validate that all dependencies exist
   */
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
          });
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}

// CLI usage
if (require.main === module) {
  const converter = new TaskMasterConverter();

  const inputFile = process.argv[2] || 'taskmaster_tasks.md';
  const outputFile = process.argv[3] || '.taskmaster/tasks/tasks.json';

  // Ensure output directory exists
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    converter.convert(inputFile, outputFile);
    console.log('\n🎉 Conversion completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Review the generated tasks.json file');
    console.log('2. Run: task-master list (or use MCP get_tasks)');
    console.log('3. Start development with: task-master next');
  } catch (error) {
    console.error('\n💥 Conversion failed:', error.message);
    process.exit(1);
  }
}

module.exports = TaskMasterConverter;
