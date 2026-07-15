<p align="center">
  <img src="docs/assets/logo.svg" alt="webflow-agent-kit" width="400" />
</p>

<p align="center">
  <strong>The open-source AI agent toolkit for Webflow</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@webflow-agent-kit/core"><img src="https://img.shields.io/npm/v/@webflow-agent-kit/core" alt="npm version" /></a>
  <a href="https://github.com/anilpervaiz/webflow-agent-kit/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@webflow-agent-kit/core" alt="license" /></a>
  <a href="https://github.com/anilpervaiz/webflow-agent-kit/actions"><img src="https://img.shields.io/github/actions/workflow/status/anilpervaiz/webflow-agent-kit/ci.yml" alt="CI" /></a>
</p>

---

## What is webflow-agent-kit?

**webflow-agent-kit** is a TypeScript-first, framework-agnostic toolkit that exposes [Webflow's Data API](https://developers.webflow.com/data/reference) as strongly-typed, Zod-validated AI agent tools. Drop them into Vercel AI SDK, LangChain, Google ADK, OpenAI Agents SDK, or any MCP-aware client.

```bash
npm install @webflow-agent-kit/core @webflow-agent-kit/vercel-ai webflow-api
```

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
```

## Features

- **100+ Tools** across **18 API groups** — Sites, Pages, CMS, Ecommerce, Assets, Forms, Webhooks, SEO, Redirects, Custom Code, Components, Localization, Audit Logs, and more
- **Framework-Agnostic** — Vercel AI SDK, LangChain, Google ADK, MCP, and CLI adapters
- **Full Zod Validation** — Every input schema is validated at runtime
- **Auth Flexibility** — Site tokens, OAuth, or environment variables
- **Built-in Rate Limiting** — Token bucket with exponential backoff for Webflow's rate limits
- **Self-Hostable** — No Composio/Zapier dependency, fully open source (MIT)
- **Tree-Shakeable** — Import only the tool groups you need

## Packages

| Package | Description | npm |
|---|---|---|
| `@webflow-agent-kit/core` | Typed tool definitions with Zod schemas | [![npm](https://img.shields.io/npm/v/@webflow-agent-kit/core)](https://www.npmjs.com/package/@webflow-agent-kit/core) |
| `@webflow-agent-kit/vercel-ai` | Vercel AI SDK `tool()` adapter | [![npm](https://img.shields.io/npm/v/@webflow-agent-kit/vercel-ai)](https://www.npmjs.com/package/@webflow-agent-kit/vercel-ai) |
| `@webflow-agent-kit/langchain` | LangChain `DynamicStructuredTool` adapter | [![npm](https://img.shields.io/npm/v/@webflow-agent-kit/langchain)](https://www.npmjs.com/package/@webflow-agent-kit/langchain) |
| `@webflow-agent-kit/mcp` | Standalone MCP server | [![npm](https://img.shields.io/npm/v/@webflow-agent-kit/mcp)](https://www.npmjs.com/package/@webflow-agent-kit/mcp) |
| `@webflow-agent-kit/cli` | CLI runner (`wfak` command) | [![npm](https://img.shields.io/npm/v/@webflow-agent-kit/cli)](https://www.npmjs.com/package/@webflow-agent-kit/cli) |

## Quick Start

### Prerequisites

1. A **Webflow account** with API access ([get a site token](https://developers.webflow.com/data/docs/getting-started#authentication) or [register an OAuth app](https://developers.webflow.com/data/docs/oauth))
2. Node.js 18+

### Installation

```bash
# Core + framework adapter
npm install @webflow-agent-kit/core @webflow-agent-kit/vercel-ai

# Optional adapters
npm install @webflow-agent-kit/langchain   # LangChain
npm install @webflow-agent-kit/mcp          # MCP Server
npm install @webflow-agent-kit/cli          # CLI
```

### Authentication

Set your token as an environment variable:

```bash
export WEBFLOW_TOKEN=your_site_token_or_oauth_access_token
```

Or pass it explicitly:

```typescript
// Site token (single-site)
const kit = createWebflowAgentKit({ type: 'site-token', token: 'your-token' });

// OAuth token (multi-site)
const kit = createWebflowAgentKit({ type: 'oauth', accessToken: 'your-oauth-token' });

// Environment variable (auto-detected)
const kit = createWebflowAgentKit({ type: 'env' });
```

## Framework Recipes

### Vercel AI SDK

```typescript
import { createWebflowAgentKit } from '@webflow-agent-kit/core';
import { toVercelAITools } from '@webflow-agent-kit/vercel-ai';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

const kit = createWebflowAgentKit({ type: 'env' });

// All tools
const tools = toVercelAITools(kit);

// Specific tool groups only
const cmsTools = toVercelAITools(kit, ['cms', 'sites']);

const { text } = await generateText({
  model: anthropic('claude-sonnet-4-5'),
  tools,
  maxSteps: 10,
  prompt: 'Create 5 blog post drafts in my CMS collection.',
});
```

### LangChain

```typescript
import { createWebflowAgentKit } from '@webflow-agent-kit/core';
import { toLangChainTools } from '@webflow-agent-kit/langchain';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';

const kit = createWebflowAgentKit({ type: 'env' });
const tools = toLangChainTools(kit, ['cms', 'pages', 'sites']);

const agent = createToolCallingAgent({ llm, tools, prompt });
const executor = new AgentExecutor({ agent, tools });
await executor.invoke({ input: 'List all sites and their CMS collections.' });
```

### MCP Server (Claude Desktop, Cursor, etc.)

```bash
npx @webflow-agent-kit/mcp
```

Or add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "webflow": {
      "command": "npx",
      "args": ["-y", "@webflow-agent-kit/mcp@latest"],
      "env": { "WEBFLOW_TOKEN": "<YOUR_TOKEN>" }
    }
  }
}
```

### CLI

```bash
# Install globally
npm install -g @webflow-agent-kit/cli

# Check auth
wfak auth

# List all sites
wfak sites

# List available tools
wfak tools
```

## Tool Groups

| Group | Tools | Key Actions |
|---|---|---|
| **Sites** | 4 | listSites, getSite, publishSite, getCustomDomains |
| **Pages** | 4 | listPages, getPageMetadata, updatePageMetadata, updateStaticContent |
| **CMS Items** | 7 | listItems, getItem, createItems, updateItems, deleteItems, publishItems, listLiveItems |
| **Collections + Fields** | 5 | listCollections, getCollection, createField, updateField, deleteField |
| **Assets** | 5 | listAssets, createAsset, getAsset, deleteAsset, listAssetFolders |
| **Forms** | 5 | listForms, getForm, listFormSubmissions, getSubmission, updateSubmission |
| **Ecommerce** | 12 | Products (4), Orders (5), Inventory (3) — full CRUD + fulfill |
| **Custom Code** | 3 | getCustomCode, upsertCustomCode, deleteCustomCode |
| **SEO** | 4 | robots.txt (get/update), well-known files (get/upload) |
| **Webhooks** | 4 | listWebhooks, createWebhook, getWebhook, deleteWebhook |
| **Redirects** | 3 | listRedirects, createRedirect, deleteRedirect |
| **Audit Logs** | 1 | listAuditLogs |

## Comparison

| Capability | Official `webflow/mcp-server` | `Composio` Webflow | **webflow-agent-kit** |
|---|---|---|---|
| Framework support | MCP only | LangChain + Claude only | **Vercel AI SDK, LangChain, ADK, MCP, CLI** |
| Tool count | 19 | ~30 | **100+ across 18 groups** |
| Zod schemas | ❌ | ❌ | ✅ |
| Self-hostable | ✅ | ❌ Composio lock-in | ✅ |
| Free / OSS | ✅ MIT | ❌ Paid tier | ✅ MIT |
| Ecommerce | ❌ | Partial | ✅ |
| Rate limiting | Basic | Managed | ✅ Built-in token bucket |
| Auth modes | 2 | 1 (Composio OAuth) | **3 (site-token, OAuth, env)** |

## Documentation

Full documentation at [docs/](docs/) including:

- [Getting Started](docs/getting-started.md)
- [Authentication Guide](docs/authentication.md)
- [Tool Reference](docs/tool-reference.md)
- [Framework Adapters](docs/framework-adapters.md)
- [Examples](examples/)
- [Contributing Guide](CONTRIBUTING.md)

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for setup and guidelines.

## License

MIT © [Anil Pervaiz](https://anilpervaiz.com) — [Flowmarc Creative](https://flowmarc.com)
