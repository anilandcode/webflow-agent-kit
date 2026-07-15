import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import type { WebflowAgentKit } from '@webflow-agent-kit/core';
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
} from '@webflow-agent-kit/core';

type ToolGroup =
  | 'sites'
  | 'pages'
  | 'cms'
  | 'collections'
  | 'assets'
  | 'forms'
  | 'custom-code'
  | 'redirects'
  | 'seo'
  | 'webhooks'
  | 'products'
  | 'orders'
  | 'inventory'
  | 'audit-logs'
  | 'all';

interface CoreTool {
  name: string;
  description: string;
  inputSchema: z.ZodType<unknown>;
  execute: (args: Record<string, unknown>) => Promise<unknown>;
}

function coreToLangChainTool(tool: CoreTool): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: tool.name,
    description: tool.description,
    schema: tool.inputSchema,
    func: tool.execute as (args: z.infer<typeof tool.inputSchema>) => Promise<unknown>,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toCore(tools: Record<string, any>): Record<string, CoreTool> {
  return tools as unknown as Record<string, CoreTool>;
}

export function toLangChainTools(
  kit: WebflowAgentKit,
  groups: ToolGroup[] = ['all'],
): DynamicStructuredTool[] {
  const includeAll = groups.includes('all');

  const toolGroups: Record<string, Record<string, CoreTool>> = {};

  if (includeAll || groups.includes('sites')) toolGroups.sites = toCore(createSiteTools(kit.client));
  if (includeAll || groups.includes('pages')) toolGroups.pages = toCore(createPageTools(kit.client));
  if (includeAll || groups.includes('cms')) toolGroups.cms = toCore(createCmsTools(kit.client));
  if (includeAll || groups.includes('collections')) toolGroups.collections = toCore(createCollectionTools(kit.client));
  if (includeAll || groups.includes('assets')) toolGroups.assets = toCore(createAssetTools(kit.client));
  if (includeAll || groups.includes('forms')) toolGroups.forms = toCore(createFormTools(kit.client));
  if (includeAll || groups.includes('custom-code')) toolGroups['custom-code'] = toCore(createCustomCodeTools(kit.client));
  if (includeAll || groups.includes('redirects')) toolGroups.redirects = toCore(createRedirectTools(kit.client));
  if (includeAll || groups.includes('seo')) toolGroups.seo = toCore(createSeoTools(kit.client));
  if (includeAll || groups.includes('webhooks')) toolGroups.webhooks = toCore(createWebhookTools(kit.client));
  if (includeAll || groups.includes('products')) toolGroups.products = toCore(createProductTools(kit.client));
  if (includeAll || groups.includes('orders')) toolGroups.orders = toCore(createOrderTools(kit.client));
  if (includeAll || groups.includes('inventory')) toolGroups.inventory = toCore(createInventoryTools(kit.client));
  if (includeAll || groups.includes('audit-logs')) toolGroups['audit-logs'] = toCore(createAuditLogTools(kit.client));

  const tools: CoreTool[] = [];
  for (const group of Object.values(toolGroups)) {
    for (const tool of Object.values(group)) {
      tools.push(tool);
    }
  }

  return tools.map(coreToLangChainTool);
}
