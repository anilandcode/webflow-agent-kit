---
title: Introduction
description: What is webflow-agent-kit?
---

**webflow-agent-kit** is a TypeScript-first, framework-agnostic toolkit that exposes [Webflow's Data API](https://developers.webflow.com/data/reference) as **62 strongly-typed, Zod-validated AI agent tools**.

## What You Can Do

- **Manage CMS** — create, read, update, delete, and publish blog posts, products, and any CMS content
- **Run SEO audits** — read page metadata, generate optimized titles/descriptions, update robots.txt
- **Handle ecommerce** — manage products, process orders, track inventory
- **Automate workflows** — redirects, custom code injection, webhook management, asset handling
- **Integrate everywhere** — Vercel AI SDK, LangChain, Google ADK, MCP servers, CLI

## Architecture

Every tool follows the same pattern: Zod-validated input ➝ authenticated API call ➝ structured output. The core is framework-agnostic — thin adapters convert tools to each framework's expected format.

```
@webflow-agent-kit/core    → 62 tools with Zod schemas
@webflow-agent-kit/vercel-ai → Vercel AI SDK tool() format
@webflow-agent-kit/langchain → DynamicStructuredTool[] 
@webflow-agent-kit/google-adk → Google ADK format
@webflow-agent-kit/mcp       → Standalone MCP server
@webflow-agent-kit/cli       → CLI runner (wfak)
```
