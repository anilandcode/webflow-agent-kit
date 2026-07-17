<p align="center">
  <strong>webflow-agent-kit</strong>
</p>

<p align="center">
  <strong>AI agent tools for Webflow</strong><br/>
  <sub>TypeScript-first · Zod-validated · Multi-framework · Public Beta</sub>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@webflow-agent-kit/core"><img src="https://img.shields.io/npm/v/@webflow-agent-kit/core" alt="npm" /></a>
  <a href="https://github.com/anilandcode/webflow-agent-kit/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@webflow-agent-kit/core" alt="license" /></a>
</p>

---

## What is webflow-agent-kit?

Exposes [Webflow's Data API](https://developers.webflow.com/data/reference) as **62 typed, Zod-validated AI agent tools**. Use them with Vercel AI SDK, LangChain, or the MCP server to control Webflow sites from any AI client.

```bash
npm install @webflow-agent-kit/core@beta @webflow-agent-kit/vercel-ai@beta
```

## Connect Your AI Client

Add this config to any MCP-compatible client and get instant access to all 62 Webflow tools:

```json
{
  "mcpServers": {
    "webflow-agent-kit": {
      "command": "npx",
      "args": ["-y", "@webflow-agent-kit/mcp@beta"],
      "env": { "WEBFLOW_TOKEN": "<YOUR_WEBFLOW_SITE_TOKEN>" }
    }
  }
}
```

### Verified Clients

| Client | Status | Setup Guide |
|---|---|---|
| **Claude Code** | ✅ Verified | [Setup](docs/clients/claude-code.md) |
| **Codex CLI** | ✅ Verified | [Setup](docs/clients/codex-cli.md) |
| **Gemini CLI** | ✅ Verified | [Setup](docs/clients/gemini-cli.md) |
| **Cursor** | 🔶 Beta — test required | [Setup](docs/clients/cursor.md) |
| **Claude Desktop** | 🔶 Beta — test required | [Setup](docs/clients/claude-desktop.md) |
| **Windsurf** | 🔶 Beta — test required | [Setup](docs/clients/windsurf.md) |
| **Kiro CLI** | 🔶 Experimental | [Setup](docs/clients/kiro.md) |
| **Generic stdio MCP** | ✅ Beta | [Setup](docs/clients/generic-mcp.md) |

## Features

- **62 tools** across **15 API groups** — Sites, Pages, CMS, Ecommerce, Assets, Forms, Webhooks, SEO, Redirects, Custom Code, Components, Audit Logs, Collections + Fields
- **Zod validation** on every tool input
- **Rate limiting** — built-in token bucket with exponential backoff
- **Bulk auto-batching** — splits >100 CMS items into API-safe chunks
- **3 auth modes** — site tokens, OAuth, environment variables
- **MCP server** — connects to Claude Code, Codex, Cursor, Claude Desktop, and any stdio MCP client
- **Skill packs** — documented recipes for SEO audit, content migration, publish workflow, ecommerce sync

## Packages

All packages are published as `0.1.0-beta.1`. Install with the `@beta` tag:

| Package | Description | npm |
|---|---|---|
| `@webflow-agent-kit/core` | 62 tools, auth, rate limiting, mutation policy | [![npm](https://img.shields.io/npm/v/@webflow-agent-kit/core)](https://www.npmjs.com/package/@webflow-agent-kit/core) |
| `@webflow-agent-kit/vercel-ai` | Vercel AI SDK adapter | [![npm](https://img.shields.io/npm/v/@webflow-agent-kit/vercel-ai)](https://www.npmjs.com/package/@webflow-agent-kit/vercel-ai) |
| `@webflow-agent-kit/mcp` | MCP server (62 tools via stdio) | [![npm](https://img.shields.io/npm/v/@webflow-agent-kit/mcp)](https://www.npmjs.com/package/@webflow-agent-kit/mcp) |
| `@webflow-agent-kit/skills` | Manifest-backed safe workflow packs | [![npm](https://img.shields.io/npm/v/@webflow-agent-kit/skills)](https://www.npmjs.com/package/@webflow-agent-kit/skills) |
| `@webflow-agent-kit/langchain` | LangChain adapter (beta) | [![npm](https://img.shields.io/npm/v/@webflow-agent-kit/langchain)](https://www.npmjs.com/package/@webflow-agent-kit/langchain) |
| `@webflow-agent-kit/cli` | CLI runner (`wfak`) | [![npm](https://img.shields.io/npm/v/@webflow-agent-kit/cli)](https://www.npmjs.com/package/@webflow-agent-kit/cli) |
| `@webflow-agent-kit/google-adk` | Google ADK adapter (experimental) | [![npm](https://img.shields.io/npm/v/@webflow-agent-kit/google-adk)](https://www.npmjs.com/package/@webflow-agent-kit/google-adk) |

## Support Status

| Package | Status | Notes |
|---|---|---|
| `@webflow-agent-kit/core` | **Beta (most mature)** | 62 tools, 71 tests, verified against live Webflow API |
| `@webflow-agent-kit/vercel-ai` | **Beta** | Vercel AI SDK adapter with group filtering |
| `@webflow-agent-kit/mcp` | **Beta** | MCP server — 62 tools via stdio. Parameter schemas simplified (P0 fix pending). Protocol smoke test passes. |
| `@webflow-agent-kit/skills` | **Beta** | SkillExecutor with dry-run defaults, confirmation gating |
| `@webflow-agent-kit/langchain` | **Beta** | Shape-compatible; no integration tests |
| `@webflow-agent-kit/cli` | **Beta** | `auth` and `sites` commands functional; `run` is a prototype |
| `@webflow-agent-kit/google-adk` | **Experimental** | Shape-compatible adapter; no Google ADK SDK dependency validated |
| `webflow-agent-kit-python` (in-repo) | **Experimental / Pre-alpha** | All adapters return `NotImplementedError`. Not published. |

## Tool Safety

Most tools are **read-only**. Mutation tools (create, update, delete, publish, fulfill) write real data to your Webflow account. These actions **cannot be automatically reversed**.

- **Default policy:** `read_only` for agent-facing APIs
- **Write operations** require explicit `{ mode: 'allow_writes' }` opt-in
- **Approval gates:** tools can be gated behind `approvalHandler` callbacks
- **Audit hooks:** every mutation decision fires an audit event

Always test with a staging site or a non-production collection before using mutation tools in automation. See [Safety and Mutations](docs/safety-and-mutations.md).

## Quick Start

```bash
npm install @webflow-agent-kit/core@beta @webflow-agent-kit/vercel-ai@beta

export WEBFLOW_TOKEN=your_token_here
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

> **Warning:** Skill packs with High mutation risk create, update, or delete real data. Test on a staging site first. Skills default to `dry_run` mode — explicit confirmation is required for mutations.

## Links

- **npm**: [@webflow-agent-kit](https://www.npmjs.com/org/webflow-agent-kit)
- **GitHub**: [anilandcode/webflow-agent-kit](https://github.com/anilandcode/webflow-agent-kit)
- **Docs**: [docs/](docs/) — Getting Started, Auth, Tool Reference, Client Setup Guides, Safety, Rate Limiting

MIT © [Anil Pervaiz](https://anilpervaiz.com) — [Flowmarc Creative](https://flowmarc.com)
