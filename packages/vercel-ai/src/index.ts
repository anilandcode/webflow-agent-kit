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

type CoreToolDefinition = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<unknown>;
};

function toVercelTool(def: CoreToolDefinition) {
  return {
    description: def.description,
    parameters: def.inputSchema,
    execute: def.execute,
  };
}

function flattenTools(
  groups: Record<string, Record<string, CoreToolDefinition>>,
): Array<CoreToolDefinition> {
  const tools: CoreToolDefinition[] = [];
  for (const group of Object.values(groups)) {
    for (const tool of Object.values(group)) {
      tools.push(tool);
    }
  }
  return tools;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toCtd(tools: Record<string, any>): Record<string, CoreToolDefinition> {
  return tools as unknown as Record<string, CoreToolDefinition>;
}

export function toVercelAITools(
  kit: WebflowAgentKit,
  groups: ToolGroup[] = ['all'],
): Record<string, ReturnType<typeof toVercelTool>> {
  const includeAll = groups.includes('all');

  const toolGroups: Record<string, Record<string, CoreToolDefinition>> = {};

  if (includeAll || groups.includes('sites')) {
    toolGroups.sites = toCtd(createSiteTools(kit.client));
  }
  if (includeAll || groups.includes('pages')) {
    toolGroups.pages = toCtd(createPageTools(kit.client));
  }
  if (includeAll || groups.includes('cms')) {
    toolGroups.cms = toCtd(createCmsTools(kit.client));
  }
  if (includeAll || groups.includes('collections')) {
    toolGroups.collections = toCtd(createCollectionTools(kit.client));
  }
  if (includeAll || groups.includes('assets')) {
    toolGroups.assets = toCtd(createAssetTools(kit.client));
  }
  if (includeAll || groups.includes('forms')) {
    toolGroups.forms = toCtd(createFormTools(kit.client));
  }
  if (includeAll || groups.includes('custom-code')) {
    toolGroups['custom-code'] = toCtd(createCustomCodeTools(kit.client));
  }
  if (includeAll || groups.includes('redirects')) {
    toolGroups.redirects = toCtd(createRedirectTools(kit.client));
  }
  if (includeAll || groups.includes('seo')) {
    toolGroups.seo = toCtd(createSeoTools(kit.client));
  }
  if (includeAll || groups.includes('webhooks')) {
    toolGroups.webhooks = toCtd(createWebhookTools(kit.client));
  }
  if (includeAll || groups.includes('products')) {
    toolGroups.products = toCtd(createProductTools(kit.client));
  }
  if (includeAll || groups.includes('orders')) {
    toolGroups.orders = toCtd(createOrderTools(kit.client));
  }
  if (includeAll || groups.includes('inventory')) {
    toolGroups.inventory = toCtd(createInventoryTools(kit.client));
  }
  if (includeAll || groups.includes('audit-logs')) {
    toolGroups['audit-logs'] = toCtd(createAuditLogTools(kit.client));
  }

  const allTools = flattenTools(toolGroups);
  const result: Record<string, ReturnType<typeof toVercelTool>> = {};
  for (const tool of allTools) {
    result[tool.name] = toVercelTool(tool);
  }
  return result;
}
