# Framework Adapters

webflow-agent-kit ships with adapters for every major AI agent framework.

## Vercel AI SDK

```bash
npm install @webflow-agent-kit/core @webflow-agent-kit/vercel-ai ai
```

```typescript
import { createWebflowAgentKit } from '@webflow-agent-kit/core';
import { toVercelAITools } from '@webflow-agent-kit/vercel-ai';
import { generateText } from 'ai';

const kit = createWebflowAgentKit({ type: 'env' });

// All tools
const tools = toVercelAITools(kit);

// Specific groups
const cmsTools = toVercelAITools(kit, ['cms', 'sites']);

const { text } = await generateText({
  model: /* your model */,
  tools,
  maxSteps: 10,
  prompt: 'List all sites.',
});
```

`toVercelAITools()` returns an object of `tool()` definitions ready for `generateText()` or `streamText()`.

## LangChain

```bash
npm install @webflow-agent-kit/core @webflow-agent-kit/langchain @langchain/core
```

```typescript
import { createWebflowAgentKit } from '@webflow-agent-kit/core';
import { toLangChainTools } from '@webflow-agent-kit/langchain';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';

const kit = createWebflowAgentKit({ type: 'env' });

// Returns DynamicStructuredTool[]
const tools = toLangChainTools(kit);

// Specific groups
const seoTools = toLangChainTools(kit, ['pages', 'cms']);

const agent = createToolCallingAgent({ llm, tools, prompt });
const executor = new AgentExecutor({ agent, tools });

await executor.invoke({ input: 'Audit SEO for all pages.' });
```

`toLangChainTools()` returns an array of `DynamicStructuredTool` objects with Zod schemas.

## MCP Server

```bash
npm install @webflow-agent-kit/mcp
```

### Standalone Server

```bash
WEBFLOW_TOKEN=your_token npx @webflow-agent-kit/mcp
```

### Claude Desktop Config

Add to `claude_desktop_config.json`:

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

### Programmatic Usage

```typescript
import { createMcpServer } from '@webflow-agent-kit/mcp';

const { server, kit } = await createMcpServer({ type: 'env' });
// server is an MCP Server instance ready for transport
```

## CLI

```bash
npm install -g @webflow-agent-kit/cli
```

```bash
# Check auth
wfak auth

# List sites
wfak sites

# List all tools
wfak tools

# Run an agent task (Phase 2)
wfak run "Create 5 blog post drafts"
```

## Cross-Framework Pattern

All adapters follow the same pattern:

1. Initialize `createWebflowAgentKit(config)` — handles auth and client
2. Select tool groups — `['sites', 'pages', 'cms', 'collections']` or `['all']`
3. Use the adapter function — `toVercelAITools`, `toLangChainTools`, etc.
4. Pass tools to your agent framework

The core tool definitions are framework-agnostic — adapters are thin wrappers that convert to each framework's tool format.
