import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { createWebflowAgentKit } from '@webflow-agent-kit/core';
import type { WebflowAuthConfig, MutationPolicy } from '@webflow-agent-kit/core';
import {
  createSiteTools,
  createPageTools,
  createCmsTools,
  createCollectionTools,
  createAssetTools,
  createFormTools,
  createCustomCodeTools,
  createRedirectTools,
  createSeoTools,
  createWebhookTools,
  createProductTools,
  createOrderTools,
  createInventoryTools,
  createAuditLogTools,
  createComponentTools,
} from '@webflow-agent-kit/core';
import { evaluatePolicy, DEFAULT_POLICY } from '@webflow-agent-kit/core';

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

export async function createMcpServer(authConfig?: WebflowAuthConfig, policyOverride?: Partial<MutationPolicy>) {
  const config = authConfig ?? { type: 'env' as const };
  const kit = createWebflowAgentKit(config);
  const activePolicy: MutationPolicy = { ...DEFAULT_POLICY, ...policyOverride };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tc = (tools: Record<string, any>): Record<string, CoreTool> =>
    tools as unknown as Record<string, CoreTool>;

  const toolGroups: Record<string, Record<string, CoreTool>> = {
    sites: tc(createSiteTools(kit.client)),
    pages: tc(createPageTools(kit.client)),
    cms: tc(createCmsTools(kit.client)),
    collections: tc(createCollectionTools(kit.client)),
    assets: tc(createAssetTools(kit.client)),
    forms: tc(createFormTools(kit.client)),
    'custom-code': tc(createCustomCodeTools(kit.client)),
    redirects: tc(createRedirectTools(kit.client)),
    seo: tc(createSeoTools(kit.client)),
    webhooks: tc(createWebhookTools(kit.client)),
    products: tc(createProductTools(kit.client)),
    orders: tc(createOrderTools(kit.client)),
    inventory: tc(createInventoryTools(kit.client)),
    'audit-logs': tc(createAuditLogTools(kit.client)),
    components: tc(createComponentTools(kit.client)),
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

    // Evaluate mutation policy before executing
    const policyResult = evaluatePolicy(
      request.params.name,
      (request.params.arguments ?? {}) as Record<string, unknown>,
      activePolicy,
    );

    if (!policyResult.allowed) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              blocked: true,
              tool: request.params.name,
              reason: policyResult.reason,
              mode: policyResult.mode,
            }, null, 2),
          },
        ],
        isError: true,
      };
    }

    if (policyResult.requiresApproval) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              approvalRequired: true,
              tool: request.params.name,
              message: `Tool "${request.params.name}" requires explicit approval. Set mode to 'allow_writes' or configure an approvalHandler to skip.`,
              request: policyResult.approvalRequest,
            }, null, 2),
          },
        ],
        isError: true,
      };
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
