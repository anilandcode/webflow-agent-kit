# Why I Built webflow-agent-kit

*By Anil Pervaiz — July 2026*

I manage a lot of Webflow sites. Like many developers, I reached for AI agents to automate the boring stuff — CMS content, SEO audits, inventory syncs. But I kept hitting the same wall: **there was no open-source library that gave me clean, typed, agent-ready Webflow tools.**

## The Gap

The official `webflow/mcp-server` has 85 stars and covers 19 consolidated tools. It's MCP-only, has no Zod validation, and no support for Vercel AI SDK or LangChain.

Composio has a Webflow integration, but it requires a paid account and locks you into their ecosystem.

I wanted:

```typescript
import { createWebflowAgentKit } from '@webflow-agent-kit/core';
import { toVercelAITools } from '@webflow-agent-kit/vercel-ai';

const kit = createWebflowAgentKit({ type: 'env' });
const tools = toVercelAITools(kit);

// Done. Use with any framework.
```

## What It Does

**webflow-agent-kit** exposes **62 strongly-typed tools** across **15 API groups** — every Data API endpoint Webflow offers, from Sites and Pages to Ecommerce Products, Orders, and Inventory. Each tool has Zod validation, LLM-optimized descriptions, and framework-agnostic execution.

It ships with adapters for Vercel AI SDK, LangChain, Google ADK, and MCP — plus a CLI and a standalone MCP server you can plug into Claude Desktop in 3 lines of config.

## Why Open Source

Webflow has 300k+ active developers and a growing App Marketplace. They sponsor community tools through the Collective Fund. An open-source SDK that lives outside Composio/Zapier is the missing layer between Webflow's API and the AI agent ecosystem.

## What's Next

- **Skill packs** — pre-composed agent recipes for SEO audits, content migrations, publish workflows, and ecommerce syncs
- **Python bindings** — for OpenAI Agents SDK users
- **Webflow App Marketplace** — companion Designer Extension
- **HelmOS integration** — register skill packs in the skill marketplace

If you use Webflow and AI agents, try it out:

```bash
npm install @webflow-agent-kit/core @webflow-agent-kit/vercel-ai
```

[GitHub →](https://github.com/anilpervaiz/webflow-agent-kit)

---

*Anil Pervaiz builds at [anilpervaiz.com](https://anilpervaiz.com) and runs [Flowmarc Creative](https://flowmarc.com).*
