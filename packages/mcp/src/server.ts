import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { createWebflowAgentKit, type WebflowAuthConfig } from '@webflow-agent-kit/core';
import {
  createSiteTools,
  createPageTools,
  createCmsTools,
  createCollectionTools,
} from '@webflow-agent-kit/core';

type CoreTool = {
  name: string;
  description: string;
  inputSchema: { _def?: unknown; shape?: unknown; [key: string]: unknown };
  execute: (args: Record<string, unknown>) => Promise<unknown>;
};

function coreToMcpSchema(tool: CoreTool): Tool {
  return {
    name: tool.name,
    description: tool.description,
    inputSchema: {
      type: 'object',
      properties: {},
    },
  };
}

function flattenToolGroups(
  groups: Record<string, Record<string, CoreTool>>,
): Map<string, CoreTool> {
  const map = new Map<string, CoreTool>();
  for (const group of Object.values(groups)) {
    for (const [, tool] of Object.entries(group)) {
      map.set(tool.name, tool);
    }
  }
  return map;
}

export async function createMcpServer(authConfig?: WebflowAuthConfig) {
  const config = authConfig ?? { type: 'env' as const };
  const kit = createWebflowAgentKit(config);

  const toolGroups: Record<string, Record<string, CoreTool>> = {
    sites: createSiteTools(kit.client) as unknown as Record<string, CoreTool>,
    pages: createPageTools(kit.client) as unknown as Record<string, CoreTool>,
    cms: createCmsTools(kit.client) as unknown as Record<string, CoreTool>,
    collections: createCollectionTools(kit.client) as unknown as Record<string, CoreTool>,
  };

  const tools = flattenToolGroups(toolGroups);

  const server = new Server(
    { name: 'webflow-agent-kit-mcp', version: '0.0.1' },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: Array.from(tools.values()).map(coreToMcpSchema),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
    const tool = tools.get(request.params.name);
    if (!tool) {
      throw new Error(`Unknown tool: ${request.params.name}`);
    }
    try {
      const result = await tool.execute(request.params.arguments ?? {});
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{ type: 'text', text: `Error: ${message}` }],
        isError: true,
      };
    }
  });

  return { server, kit };
}

async function main() {
  const { server } = await createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('MCP server failed to start:', error);
  process.exit(1);
});
