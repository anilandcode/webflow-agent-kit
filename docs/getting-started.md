# Getting Started

This guide walks you through installing webflow-agent-kit and running your first agent task.

## Prerequisites

- Node.js 18+
- A Webflow account with API access
- A Webflow [site token](https://developers.webflow.com/data/docs/getting-started#authentication) or [OAuth app](https://developers.webflow.com/data/docs/oauth)

## Installation

### Core + Vercel AI SDK (Recommended)

```bash
npm install @webflow-agent-kit/core @webflow-agent-kit/vercel-ai ai @ai-sdk/anthropic
```

### All Packages

```bash
npm install @webflow-agent-kit/core @webflow-agent-kit/vercel-ai @webflow-agent-kit/langchain @webflow-agent-kit/mcp @webflow-agent-kit/cli
```

## Set Your Token

```bash
export WEBFLOW_TOKEN=your_token_here
```

Or create a `.env` file:

```
WEBFLOW_TOKEN=your_token_here
```

## Your First Agent

Create `agent.ts`:

```typescript
import { createWebflowAgentKit } from '@webflow-agent-kit/core';
import { toVercelAITools } from '@webflow-agent-kit/vercel-ai';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

async function main() {
  // Initialize with env-based auth
  const kit = createWebflowAgentKit({ type: 'env' });

  // Get all tools
  const tools = toVercelAITools(kit);

  // Run the agent
  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-5'),
    tools,
    maxSteps: 10,
    prompt: 'List all my Webflow sites and their published status.',
  });

  console.log(text);
}

main();
```

Run it:

```bash
npx tsx agent.ts
```

## What's Next

- [Authentication Guide](authentication.md) — Learn about the 3 auth modes
- [Tool Reference](tool-reference.md) — Complete list of all tools
- [Framework Adapters](framework-adapters.md) — LangChain, MCP, CLI usage
- [Examples](../examples/) — Run the demo apps
