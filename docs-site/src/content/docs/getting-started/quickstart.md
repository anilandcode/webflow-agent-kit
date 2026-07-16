---
title: Quick Start
description: Get up and running in 2 minutes.
---

## Install

```bash
npm install @webflow-agent-kit/core @webflow-agent-kit/vercel-ai ai @ai-sdk/anthropic
```

## Set Your Token

```bash
export WEBFLOW_TOKEN=your_token_here
```

## Your First Agent

```typescript
import { createWebflowAgentKit } from '@webflow-agent-kit/core';
import { toVercelAITools } from '@webflow-agent-kit/vercel-ai';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

const kit = createWebflowAgentKit({ type: 'env' });
const tools = toVercelAITools(kit);

const { text } = await generateText({
  model: anthropic('claude-sonnet-4-5'),
  tools,
  maxSteps: 10,
  prompt: 'List all my Webflow sites and their published status.',
});

console.log(text);
```

## Next

- [Authentication](/authentication/overview) — site tokens, OAuth, env vars
- [Tool Reference](/tools/overview) — all 62 tools
- [Framework Adapters](/adapters/vercel-ai) — LangChain, ADK, MCP
