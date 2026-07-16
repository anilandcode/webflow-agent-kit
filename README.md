<p align="center">
  <strong>webflow-agent-kit</strong>
</p>

<p align="center">
  <strong>AI agent tools for Webflow</strong><br/>
  <sub>TypeScript-first · Zod-validated · Multi-framework</sub>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@webflow-agent-kit/core"><img src="https://img.shields.io/npm/v/@webflow-agent-kit/core" alt="npm" /></a>
  <a href="https://github.com/anilandcode/webflow-agent-kit/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@webflow-agent-kit/core" alt="license" /></a>
</p>

---

## What is webflow-agent-kit?

Exposes [Webflow's Data API](https://developers.webflow.com/data/reference) as **62 typed, Zod-validated AI agent tools**. Use them with Vercel AI SDK, LangChain, or the MCP server (Claude Code, Codex, Cursor).

```bash
npm install @webflow-agent-kit/core @webflow-agent-kit/vercel-ai
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

- **62 tools** across **15 API groups** — Sites, Pages, CMS, Ecommerce, Assets, Forms, Webhooks, SEO, Redirects, Custom Code, Components, Audit Logs, Collections + Fields
- **Zod validation** on every tool input
- **Rate limiting** — built-in token bucket with exponential backoff
- **Bulk auto-batching** — splits >100 CMS items into API-safe chunks
- **3 auth modes** — site tokens, OAuth, environment variables
- **MCP server** — connects to Claude Code, Codex, Cursor, Claude Desktop
- **Quick-start examples** for Vercel AI SDK, LangChain, and MCP
- **Skill packs** — documented recipes for SEO audit, content migration, publish workflow, ecommerce sync
- MIT license, self-hostable, no third-party platform dependency

## Packages

| Package | Description | npm |
|---|---|---|
| `@webflow-agent-kit/core` | 62 tools, auth, rate limiting | [![npm](https://img.shields.io/npm/v/@webflow-agent-kit/core)](https://www.npmjs.com/package/@webflow-agent-kit/core) |
| `@webflow-agent-kit/vercel-ai` | Vercel AI SDK adapter | [![npm](https://img.shields.io/npm/v/@webflow-agent-kit/vercel-ai)](https://www.npmjs.com/package/@webflow-agent-kit/vercel-ai) |
| `@webflow-agent-kit/langchain` | LangChain adapter | [![npm](https://img.shields.io/npm/v/@webflow-agent-kit/langchain)](https://www.npmjs.com/package/@webflow-agent-kit/langchain) |
| `@webflow-agent-kit/mcp` | MCP server (Claude Code, Codex, Cursor, Claude Desktop) | [![npm](https://img.shields.io/npm/v/@webflow-agent-kit/mcp)](https://www.npmjs.com/package/@webflow-agent-kit/mcp) |
| `@webflow-agent-kit/cli` | CLI runner (`wfak auth`, `wfak sites`, `wfak tools`) | [![npm](https://img.shields.io/npm/v/@webflow-agent-kit/cli)](https://www.npmjs.com/package/@webflow-agent-kit/cli) |
| `@webflow-agent-kit/google-adk` | Google ADK adapter (beta) | [![npm](https://img.shields.io/npm/v/@webflow-agent-kit/google-adk)](https://www.npmjs.com/package/@webflow-agent-kit/google-adk) |

## Support Status

| Package | Status | Notes |
|---|---|---|
| `@webflow-agent-kit/core` | **Stable** | 62 tools, 30 tests, verified against live Webflow API |
| `@webflow-agent-kit/vercel-ai` | **Stable** | Vercel AI SDK adapter with group filtering |
| `@webflow-agent-kit/langchain` | **Stable** | LangChain adapter with group filtering |
| `@webflow-agent-kit/mcp` | **Beta** | Functional MCP server — parameter schemas stripped to basic shape (P0 fix pending) |
| `@webflow-agent-kit/cli` | **Beta** | `auth` and `sites` commands stable; `run` command is a prototype |
| `@webflow-agent-kit/google-adk` | **Experimental** | Shape-compatible adapter; no Google ADK SDK dependency validated |
| `webflow-agent-kit-python` (in-repo) | **Planned** | Scaffold only — all adapters return placeholder data |

### Tool Safety

Most tools are **read-only**. Mutation tools (create, update, delete, publish, fulfill) write real data to your Webflow account. These actions **cannot be automatically reversed**. Always test with a staging site or a non-production collection before using mutation tools in automation.

## Quick Start

```bash
npm install @webflow-agent-kit/core @webflow-agent-kit/vercel-ai ai @ai-sdk/anthropic

# Set your token
export WEBFLOW_TOKEN=your_token_here
export ANTHROPIC_API_KEY=your_key_here
```

## MCP Server

Connect Claude Code, Codex, Cursor, or Claude Desktop to Webflow in one config block:

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

### Claude Code

Add to `~/.claude/mcp.json`:

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

Then: `> List my Webflow sites`

### Codex / Cursor / Windsurf / Cody

Add the same config via each editor's MCP settings panel.

### Claude Desktop

Edit `claude_desktop_config.json` (Help → Developer → Edit Config) with the block above.

> **Note:** The MCP server is functional but parameter type schemas may show as simplified shapes. A fix is tracked in the [production readiness plan](docs/production-readiness-plan.md).

## Tool Groups

| Group | Tools | |
|---|---|---|
| Sites | 4 | list, get, publish, custom domains |
| Pages | 4 | list, get/update metadata, update static content |
| CMS Items | 7 | full CRUD + publish + live listing (auto-batched) |
| Collections + Fields | 5 | list/get collections, CRUD for fields |
| Assets | 5 | list, create (S3 upload), get, delete, folders |
| Forms | 5 | list, get, list/get/update submissions |
| Ecommerce | 12 | Products (4), Orders (5), Inventory (3) |
| Custom Code | 3 | get, upsert header/footer scripts, delete |
| Redirects | 3 | list, create, delete (Enterprise only) |
| SEO | 4 | robots.txt get/update, well-known files (Enterprise only) |
| Webhooks | 4 | list, create, get, delete |
| Components | 5 | list, get/update content, get/update properties |
| Audit Logs | 1 | list workspace audit logs |

## Skill Packs

Documented multi-step recipes included in the repo — see [skill-packs/](skill-packs/):

| Skill | Tool Groups | Mutation Risk |
|---|---|---|
| [SEO Audit](skill-packs/seo-audit/) | pages, seo, sites | Low (metadata updates) |
| [Content Migration](skill-packs/content-migration/) | cms, collections | High (creates items) |
| [Publish Workflow](skill-packs/publish-workflow/) | cms | Medium (publishes staged items) |
| [Ecommerce Sync](skill-packs/ecommerce-sync/) | inventory, products, orders | High (modifies inventory) |

> **Warning:** Skill packs with High mutation risk create, update, or delete real data. Test on a staging site first. No built-in guardrails prevent destructive mutations — review the prompt and tool groups before running.

## Comparison

| Capability | Official MCP | Composio | **webflow-agent-kit** |
|---|---|---|---|
| Tools | 19 | ~30 | **62** |
| Frameworks | MCP only | LangChain | **Vercel AI SDK, LangChain, MCP, CLI** |
| MCP clients | Desktop | — | Claude Code, Codex, Cursor, Desktop |
| Zod validation | ❌ | ❌ | ✅ |
| Ecommerce | ❌ | Partial | ✅ Full (products, orders, inventory) |
| Components | ❌ | ❌ | ✅ |
| Skill packs | ❌ | ❌ | ✅ (documented recipes) |
| Self-hostable | ✅ | ❌ | ✅ |
| Free | ✅ | ❌ | ✅ MIT |

## Links

- **npm**: [@webflow-agent-kit](https://www.npmjs.com/org/webflow-agent-kit)
- **GitHub**: [anilandcode/webflow-agent-kit](https://github.com/anilandcode/webflow-agent-kit)
- **Docs**: [docs/](docs/) — Getting Started, Auth, Tool Reference, Framework Adapters, Rate Limiting, Production Readiness Plan
- **Blog**: ["Why I built webflow-agent-kit"](docs/blog-post.md)

MIT © [Anil Pervaiz](https://anilpervaiz.com) — [Flowmarc Creative](https://flowmarc.com)
