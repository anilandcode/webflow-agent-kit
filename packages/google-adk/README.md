# @webflow-agent-kit/google-adk — BETA

Google ADK adapter for webflow-agent-kit.

> **Status:** Beta. Shape-compatible — no integration tests with real Google ADK SDK exist.

## Install

```bash
npm install @webflow-agent-kit/core @webflow-agent-kit/google-adk zod
```

## Usage

```typescript
import { createWebflowAgentKit } from '@webflow-agent-kit/core';
import { toGoogleADKTools } from '@webflow-agent-kit/google-adk';

const kit = createWebflowAgentKit({ type: 'env' });
const tools = toGoogleADKTools(kit);
```

See the [main README](https://github.com/anilandcode/webflow-agent-kit) for full documentation.
