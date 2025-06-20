# TaskMaster Setup Guide for CanAI Platform

## ✅ Current Status

Your CanAI project is **partially set up** with TaskMaster. Here's what's been configured:

### ✅ What's Already Done

1. **TaskMaster Initialized** - `.taskmaster/` directory exists with proper structure
2. **Configuration File** - `.taskmaster/config.json` with proper AI models configured
3. **Tasks File** - `tasks/tasks.json` with 15 comprehensive tasks (IDs 16-30)
4. **PRD File** - `.taskmaster/docs/prd.txt` exists for AI-powered task generation
5. **MCP Integration** - `.cursor/mcp.json` configured for Cursor IDE integration
6. **Project Structure** - Proper directory organization with backend, frontend, databases

### 🔧 Configuration Details

**AI Models Configured:**
- **Main**: Claude 3.7 Sonnet (for primary task operations)
- **Research**: Perplexity Sonar Pro (for research-backed operations)
- **Fallback**: Claude 3.5 Sonnet (backup model)

**Project Settings:**
- **Project Name**: CanAI Emotional Sovereignty Platform
- **Tasks Path**: `tasks/tasks.json`
- **PRD Path**: `.taskmaster/docs/prd.txt`
- **Current Tag**: master

## 🚨 Required Actions

### 1. Verify API Keys

Ensure you have the following API keys configured in your environment:

```bash
# Required for TaskMaster MCP integration
ANTHROPIC_API_KEY=your_anthropic_key_here
PERPLEXITY_API_KEY=your_perplexity_key_here

# Optional but recommended
OPENAI_API_KEY=your_openai_key_here
GOOGLE_API_KEY=your_google_key_here
```

### 2. Test TaskMaster Connection

Run this command to verify TaskMaster is working:

```bash
# Test basic functionality
npx task-master-ai get-tasks

# Test model configuration
npx task-master-ai models
```

### 3. Generate Individual Task Files

Once API keys are working, generate individual task files:

```bash
# Generate task files from tasks.json
npx task-master-ai generate

# Analyze task complexity
npx task-master-ai analyze-project-complexity --research
```

### 4. Expand High-Priority Tasks

Expand the foundation tasks into subtasks:

```bash
# Expand critical infrastructure tasks
npx task-master-ai expand-task --id 16 --num 8  # Monorepo setup
npx task-master-ai expand-task --id 17 --num 10 # Supabase integration
npx task-master-ai expand-task --id 18 --num 12 # Backend API framework
```

## 📋 Current Task Structure

Your project has **15 main tasks** covering the complete 9-stage user journey:

### Foundation Tasks (IDs 16-19)
- **16**: Monorepo Structure & TypeScript Configuration
- **17**: Supabase Integration (Auth & Database)
- **18**: Backend API Framework with Error Handling
- **19**: User Interaction Logging & Analytics

### User Journey Tasks (IDs 20-28)
- **20**: F1 - Discovery Hook with Trust Indicators
- **21**: F2 - 2-Step Discovery Funnel
- **22**: F3 - GPT-4o Spark Layer Integration
- **23**: F4 - Stripe Purchase Flow
- **24**: F5 - Detailed Input Collection System
- **25**: F6 - Intent Mirror Feature
- **26**: F7 - Deliverable Generation System
- **27**: F8 - SparkSplit Comparison System
- **28**: F9 - Feedback Capture System

### Integration Tasks (IDs 29-30)
- **29**: Make.com Workflow Automation
- **30**: Memberstack User Management

## 🎯 Next Steps

### Immediate (Priority 1)
1. **Verify API Keys** - Ensure Anthropic and Perplexity keys are working
2. **Test TaskMaster** - Run basic commands to verify functionality
3. **Generate Task Files** - Create individual markdown files for each task

### Short-term (Priority 2)
1. **Expand Foundation Tasks** - Break down tasks 16-18 into detailed subtasks
2. **Analyze Complexity** - Use research mode to identify tasks needing expansion
3. **Set Up Next Task** - Use `next-task` command to identify starting point

### Medium-term (Priority 3)
1. **Expand User Journey Tasks** - Break down F1-F9 tasks based on complexity
2. **Create Tag Structure** - Set up different tags for development phases
3. **Configure CI/CD Integration** - Set up GitHub Actions for task validation

## 🔍 Troubleshooting

### If TaskMaster Commands Fail

1. **Check API Keys**: Verify environment variables are set correctly
2. **Verify Installation**: Run `npm install -g task-master-ai`
3. **Check Project Root**: Ensure you're running commands from project root
4. **Validate JSON**: Check `tasks/tasks.json` for syntax errors

### If Tasks Don't Load

1. **Check File Format**: Ensure `tasks.json` follows correct schema
2. **Verify Permissions**: Ensure files are readable
3. **Reset State**: Delete `.taskmaster/state.json` and restart

### If AI Operations Fail

1. **Check API Quotas**: Verify you haven't exceeded rate limits
2. **Test API Keys**: Use curl to test API endpoints directly
3. **Check Network**: Ensure internet connectivity for AI services

## 📚 Useful Commands

```bash
# Get all tasks
npx task-master-ai get-tasks --with-subtasks

# Get next task to work on
npx task-master-ai next-task

# Get specific task details
npx task-master-ai get-task --id 16

# Update task status
npx task-master-ai set-task-status --id 16 --status in-progress

# Add new task
npx task-master-ai add-task --prompt "Create user authentication middleware"

# Expand task into subtasks
npx task-master-ai expand-task --id 16 --num 8

# Analyze project complexity
npx task-master-ai analyze-project-complexity --threshold 5

# Generate task files
npx task-master-ai generate

# Parse PRD for new tasks (if needed)
npx task-master-ai parse-prd --num-tasks 20 --research
```

## 📊 Success Metrics

Your TaskMaster setup will be fully operational when:

- ✅ All API keys are configured and working
- ✅ `npx task-master-ai get-tasks` returns 15 tasks
- ✅ Individual task files are generated in `tasks/` directory
- ✅ Foundation tasks (16-18) are expanded into subtasks
- ✅ `npx task-master-ai next-task` identifies the starting task
- ✅ Task status updates work correctly

## 🔗 Integration Points

Your TaskMaster setup integrates with:

- **Cursor IDE**: Via MCP configuration in `.cursor/mcp.json`
- **GitHub Actions**: Workflows in `.github/workflows/` for validation
- **PRD Document**: AI-powered task generation from requirements
- **Project Structure**: Aligned with CanAI architecture and guidelines

---

**Status**: Setup in progress - API key verification needed
**Next Action**: Verify ANTHROPIC_API_KEY and PERPLEXITY_API_KEY are configured
**Contact**: Check environment variables and run test commands
