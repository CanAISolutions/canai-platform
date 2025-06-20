#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Manual task creation script...');

// Sample tasks from Section 6.1
const sampleTasks = [
  {
    originalId: "T6.1.1-messages-api",
    title: "Messages API",
    description: "Implement GET /v1/messages API to fetch trust indicators with caching and stats",
    details: "- Create Express route for GET /v1/messages\n- Integrate Supabase client to query trust_indicators\n- Calculate stats (SELECT COUNT(*) FROM comparisons WHERE created_at IS NOT NULL)\n- Implement caching with node-cache\n- Log funnel_step event with PostHog",
    inputs: ["backend/routes/messages.js", "backend/services/cache.js", "databases/migrations/trust_indicators.sql"],
    outputs: ["API response with trust indicators and stats", "Cached trust indicators (5-minute TTL)"]
  },
  {
    originalId: "T6.1.2-log-interaction",
    title: "Log Interaction API",
    description: "Implement POST /v1/log-interaction API and Make.com webhook for interaction logging",
    details: "- Create Express route for POST /v1/log-interaction\n- Validate request with Joi (interaction_type, details)\n- Store logs in Supabase session_logs\n- Set up Make.com webhook handler\n- Log pricing_modal_viewed event with PostHog",
    inputs: ["backend/routes/interactions.js", "backend/webhooks/log_interaction.js"],
    outputs: ["API response with logged interactions", "Webhook handler for interaction logging"]
  },
  {
    originalId: "T6.1.3-preview-spark",
    title: "Preview Spark API",
    description: "Implement POST /v1/generate-preview-spark API for free spark generation with sample PDF serving",
    details: "- Create Express route for POST /v1/generate-preview-spark\n- Implement GPT-4o prompt\n- Validate inputs (businessType, tone) with Joi\n- Serve sample PDFs via Supabase storage\n- Log preview_viewed event with PostHog",
    inputs: ["backend/routes/sparks.js", "backend/services/gpt4o.js", "backend/prompts/preview_spark.js"],
    outputs: ["API response with single spark", "Sample PDFs served from Supabase storage"]
  }
];

function createBasicTasksJson() {
  const tasksData = {
    version: "1.0.0",
    project: {
      name: "CanAI Platform Backend",
      description: "Backend development tasks converted from YAML format",
      created: new Date().toISOString()
    },
    tags: {
      master: {
        name: "master",
        description: "Main development tasks",
        created: new Date().toISOString(),
        tasks: []
      }
    },
    metadata: {
      totalTasks: 0,
      lastUpdated: new Date().toISOString()
    }
  };

  // Convert sample tasks to TaskMaster format
  sampleTasks.forEach((task, index) => {
    const taskId = index + 1;

    tasksData.tags.master.tasks.push({
      id: taskId,
      title: task.title,
      description: task.description,
      status: "pending",
      priority: "medium",
      dependencies: [],
      details: task.details,
      testStrategy: `Verify implementation meets requirements:\n${task.outputs.map(o => `- ${o}`).join('\n')}`,
      subtasks: [],
      metadata: {
        originalId: task.originalId,
        section: "6.1 - Messages and Interactions",
        inputs: task.inputs,
        outputs: task.outputs,
        createdAt: new Date().toISOString()
      }
    });
  });

  tasksData.metadata.totalTasks = sampleTasks.length;

  // Ensure directory exists
  const outputDir = '.taskmaster/tasks';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write the file
  const outputFile = path.join(outputDir, 'tasks.json');
  fs.writeFileSync(outputFile, JSON.stringify(tasksData, null, 2));

  console.log(`✅ Created ${outputFile} with ${sampleTasks.length} tasks`);
  console.log('📋 Tasks created:');
  sampleTasks.forEach((task, index) => {
    console.log(`  ${index + 1}. ${task.title}`);
  });

  return outputFile;
}

// Execute
try {
  const outputFile = createBasicTasksJson();
  console.log('\n🎉 Success! Try running: mcp_task-master-ai_get_tasks');
} catch (error) {
  console.error('❌ Error:', error.message);
}
