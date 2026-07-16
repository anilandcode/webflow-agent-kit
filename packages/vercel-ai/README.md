# @webflow-agent-kit/vercel-ai

Vercel AI SDK adapter for webflow-agent-kit.

## Install

```bash
npm install @webflow-agent-kit/core @webflow-agent-kit/vercel-ai ai
```

This package requires `ai` >= 4.0.0 as a peer dependency.

## Usage

```typescript
import { createWebflowAgentKit } from '@webflow-agent-kit/core';
import { toVercelAITools } from '@webflow-agent-kit/vercel-ai';

const kit = createWebflowAgentKit({ type: 'env' });
const tools = toVercelAITools(kit); // All 62 tools
```

See the [main README](https://github.com/anilandcode/webflow-agent-kit) for full documentation.
