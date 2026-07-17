# Getting Started

## Prerequisites

- **Node.js** 18.0.0 or later (tested on 20 and 22)
- **pnpm** 9.x (Corepack-managed — enabled automatically)
- A Webflow account with [API access](https://developers.webflow.com/data/docs/getting-started#authentication)

## Installation

### Production (from npm)

```bash
npm install @webflow-agent-kit/core @webflow-agent-kit/vercel-ai
```

For specific frameworks:

```bash
# LangChain
npm install @webflow-agent-kit/core @webflow-agent-kit/langchain @langchain/core zod

# MCP server (Claude Code, Codex, Cursor)
npm install @webflow-agent-kit/mcp

# CLI
npm install -g @webflow-agent-kit/cli
```

[Full dependency compatibility matrix →](dependency-compatibility.md)

### Development (clone the repo)

```bash
corepack enable
git clone https://github.com/anilandcode/webflow-agent-kit.git
cd webflow-agent-kit
pnpm install
pnpm build
pnpm typecheck
pnpm test
```

## Set Your Webflow Token

```bash
export WEBFLOW_TOKEN=your_token_here
```

For demos, create `.env.local` in the example directory:

```env
WEBFLOW_TOKEN=your_token
GOOGLE_GENERATIVE_AI_API_KEY=your_key  # Free tier
```

**Never commit `.env` files.** They are in `.gitignore`.

## First Agent (Vercel AI SDK)

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

Run: `npx tsx agent.ts`

## First Agent (MCP — Claude Code)

Add to `~/.claude/mcp.json`:

```json
{
  "mcpServers": {
    "webflow": {
      "command": "npx",
      "args": ["-y", "@webflow-agent-kit/mcp@beta"],
      "env": { "WEBFLOW_TOKEN": "<YOUR_TOKEN>" }
    }
  }
}
```

Then in Claude Code: `> List my Webflow sites`

## Auth Modes

webflow-agent-kit supports three authentication modes:

```typescript
// Environment variable (recommended)
const kit = createWebflowAgentKit({ type: 'env' });

// Site token (single-site)
const kit = createWebflowAgentKit({ type: 'site-token', token: 'xxx' });

// OAuth (multi-site)
const kit = createWebflowAgentKit({ type: 'oauth', accessToken: 'xxx' });
```

[Full authentication guide →](authentication.md)

## Safety Default

All agent-facing APIs default to **read-only**. Write operations must be explicitly enabled through the mutation policy.

[Safety and mutations guide →](safety-and-mutations.md)

## What's Next

- [Tool Reference](tool-reference.md) — all 62 tools
- [Framework Adapters](framework-adapters.md) — LangChain, Google ADK, MCP, CLI
- [Troubleshooting](troubleshooting.md) — common errors and fixes
- [Compatibility](compatibility.md) — supported frameworks and Node versions
