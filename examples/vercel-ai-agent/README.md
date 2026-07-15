# Webflow Agent Chat Demo

A Next.js 15 chat app where an AI agent manages a Webflow CMS blog through natural language.

## Features

- **Streaming chat** with real-time tool call visualization
- **Blog management**: list, create, update, publish, and delete CMS items
- **Tool transparency**: see every API call the agent makes with live status dots
- **Webflow-style design**: off-white surfaces, charcoal text, thin rules, memo layout

## Setup

```bash
# From the monorepo root
cd examples/vercel-ai-agent

# Install dependencies (done from root: pnpm install)

# Create .env.local with your Webflow token
echo "WEBFLOW_TOKEN=your_token_here" > .env.local
echo "ANTHROPIC_API_KEY=your_key_here" >> .env.local

# Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Try These Prompts

- "List all my Webflow sites"
- "List the CMS collections in my site"
- "Create a blog post draft titled 'AI Trends in 2026'"
- "Show me all published blog posts"
- "Publish the draft about AI Trends"

## Architecture

```
app/
├── api/chat/route.ts    → POST endpoint: streamText with webflow-agent-kit tools
├── components/Chat.tsx   → Chat UI with tool call rendering
├── layout.tsx            → Root layout
├── globals.css           → Tailwind CSS + design tokens
└── page.tsx              → Home page
```

The agent uses `createWebflowAgentKit({ type: 'env' })` to auto-read `WEBFLOW_TOKEN` from the environment, then passes all tools to Claude via Vercel AI SDK's `streamText`.

## Disclaimer

This is a demo app. It connects to your real Webflow account. **Not production advice** — the agent can create, update, and delete real CMS content.
