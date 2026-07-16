<p align="center">
  <strong>webflow-agent-kit</strong>
</p>

<p align="center">
  <strong>The open-source AI agent toolkit for Webflow</strong><br/>
  <sub>62 tools • 15 API groups • 6 adapters • Provider-agnostic</sub>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@webflow-agent-kit/core"><img src="https://img.shields.io/npm/v/@webflow-agent-kit/core" alt="npm" /></a>
  <a href="https://github.com/anilpervaiz/webflow-agent-kit/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@webflow-agent-kit/core" alt="license" /></a>
</p>

---

## What is webflow-agent-kit?

Exposes [Webflow's entire Data API](https://developers.webflow.com/data/reference) as **62 strongly-typed, Zod-validated AI agent tools**. Drop them into Vercel AI SDK, LangChain, Google ADK, MCP (Claude Code, Codex, Cursor), or CLI.

```bash
npm install @webflow-agent-kit/core @webflow-agent-kit/vercel-ai
```

```typescript
import { createWebflowAgentKit } from '@webflow-agent-kit/core';
import { toVercelAITools } from '@webflow-agent-kit/vercel-ai';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google'; // Free tier

const kit = createWebflowAgentKit({ type: 'env' });
const tools = toVercelAITools(kit);

const { text } = await generateText({
  model: google('gemini-2.0-flash'),
  tools,
  maxSteps: 10,
  prompt: 'List all my Webflow sites and their published status.',
});
```

**Provider agnostic** — auto-detects Gemini (free), Anthropic, or OpenAI from env vars. No lock-in.

## Features

- **62 Tools** across **15 API groups** — full Data API coverage
- **6 adapters** — Vercel AI SDK, LangChain, Google ADK, MCP, CLI, provider-agnostic runner
- **MCP-native** — Claude Code, Codex, Cursor, Windsurf, Cody, Claude Desktop
- **Provider-agnostic** — Gemini (free tier), Anthropic, OpenAI — auto-detected
- **Full Zod validation** — every input validated at runtime
- **Built-in rate limiting** — token bucket with exponential backoff
- **Bulk auto-batching** — splits >100 items into API-safe chunks
- **3 auth modes** — site tokens, OAuth, environment variables
- **Skill packs** — pre-built recipes: SEO audit, content migration, publish workflow, ecommerce sync
- **Self-hostable** — no Composio/Zapier dependency, MIT license

## Packages

| Package | Description | npm |
|---|---|---|
| `@webflow-agent-kit/core` | 62 tools, auth, rate limiting | [![npm](https://img.shields.io/npm/v/@webflow-agent-kit/core)](https://www.npmjs.com/package/@webflow-agent-kit/core) |
| `@webflow-agent-kit/vercel-ai` | Vercel AI SDK adapter | [![npm](https://img.shields.io/npm/v/@webflow-agent-kit/vercel-ai)](https://www.npmjs.com/package/@webflow-agent-kit/vercel-ai) |
| `@webflow-agent-kit/langchain` | LangChain adapter | [![npm](https://img.shields.io/npm/v/@webflow-agent-kit/langchain)](https://www.npmjs.com/package/@webflow-agent-kit/langchain) |
| `@webflow-agent-kit/google-adk` | Google ADK adapter | [![npm](https://img.shields.io/npm/v/@webflow-agent-kit/google-adk)](https://www.npmjs.com/package/@webflow-agent-kit/google-adk) |
| `@webflow-agent-kit/mcp` | MCP server (Claude Code, Codex, Cursor) | [![npm](https://img.shields.io/npm/v/@webflow-agent-kit/mcp)](https://www.npmjs.com/package/@webflow-agent-kit/mcp) |
| `@webflow-agent-kit/cli` | CLI runner (`wfak`) | [![npm](https://img.shields.io/npm/v/@webflow-agent-kit/cli)](https://www.npmjs.com/package/@webflow-agent-kit/cli) |

## Quick Start

```bash
npm install @webflow-agent-kit/core @webflow-agent-kit/vercel-ai ai @ai-sdk/google

# Set your tokens
export WEBFLOW_TOKEN=your_token_here
export GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
```

## MCP — Claude Code, Codex, Cursor, Claude Desktop

Zero code. Add to your MCP config:

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

Works with **Claude Code** (`.claude/mcp.json`), **Codex**, **Cursor**, **Windsurf**, **Cody**, **Claude Desktop**.

## All 62 Tools, 15 Groups

| Group | Tools | |
|---|---|---|
| Sites | 4 | list, get, publish, custom domains |
| Pages | 4 | list, get/update metadata, update static content |
| CMS Items | 7 | full CRUD + publish + live listing (auto-batched) |
| Collections + Fields | 5 | list/get collections, CRUD for fields |
| Assets | 5 | list, create, get, delete, folders |
| Forms | 5 | list, get, list/get/update submissions |
| Ecommerce | 12 | Products (4), Orders (5), Inventory (3) |
| Custom Code | 3 | get, upsert header/footer scripts, delete |
| Redirects | 3 | list, create, delete (Enterprise) |
| SEO | 4 | robots.txt get/update, well-known files |
| Webhooks | 4 | list, create, get, delete |
| Components | 5 | list, get/update content, get/update properties |
| Audit Logs | 1 | list workspace audit logs |

## Skill Packs

Pre-built recipes: [SEO Audit](skill-packs/seo-audit/), [Content Migration](skill-packs/content-migration/), [Publish Workflow](skill-packs/publish-workflow/), [Ecommerce Sync](skill-packs/ecommerce-sync/).

## Comparison

| Capability | Official MCP | Composio | **webflow-agent-kit** |
|---|---|---|---|
| Tools | 19 | ~30 | **62** |
| Frameworks | MCP only | LangChain | **6 adapters** |
| MCP clients | Desktop | — | **Code, Codex, Cursor, Desktop** |
| Zod validation | ❌ | ❌ | ✅ |
| Ecommerce | ❌ | Partial | ✅ Full |
| Components | ❌ | ❌ | ✅ |
| Skill packs | ❌ | ❌ | ✅ 4 |
| Provider-agnostic | — | — | ✅ Gemini/Anthropic/OpenAI |
| Self-hostable | ✅ | ❌ | ✅ |
| Free | ✅ | ❌ | ✅ MIT |

## Links

- **npm**: [@webflow-agent-kit](https://www.npmjs.com/org/webflow-agent-kit)
- **GitHub**: [anilpervaiz/webflow-agent-kit](https://github.com/anilpervaiz/webflow-agent-kit)
- **Docs**: [docs/](docs/) — Getting Started, Auth, Tool Reference, Framework Adapters, Rate Limiting
- **Blog**: ["Why I built webflow-agent-kit"](docs/blog-post.md)

MIT © [Anil Pervaiz](https://anilpervaiz.com) — [Flowmarc Creative](https://flowmarc.com)
