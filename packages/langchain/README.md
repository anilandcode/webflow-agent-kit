# @webflow-agent-kit/langchain — BETA

LangChain adapter for webflow-agent-kit.

> **Status:** Beta. No integration tests exist. Shape-compatible with LangChain DynamicStructuredTool.

## Install

```bash
npm install @webflow-agent-kit/core @webflow-agent-kit/langchain @langchain/core zod
```

## Usage

```typescript
import { createWebflowAgentKit } from '@webflow-agent-kit/core';
import { toLangChainTools } from '@webflow-agent-kit/langchain';

const kit = createWebflowAgentKit({ type: 'env' });
const tools = toLangChainTools(kit, ['cms', 'pages']);
```

See the [main README](https://github.com/anilandcode/webflow-agent-kit) for full documentation.
