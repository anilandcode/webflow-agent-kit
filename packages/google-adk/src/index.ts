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
  createComponentTools,
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
  | 'components'
  | 'all';

interface ADKTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Converts webflow-agent-kit tools to the Google ADK tool format.
 *
 * Google ADK expects tools to have `name`, `description`, `parameters` (JSON Schema),
 * and a callable `execute` function. This adapter maps all 15 tool groups.
 *
 * Usage:
 * ```typescript
 * const kit = createWebflowAgentKit({ type: 'env' });
 * const tools = toGoogleADKTools(kit, ['cms', 'sites']);
 * ```
 */
export function toGoogleADKTools(kit: WebflowAgentKit, groups: ToolGroup[] = ['all']): ADKTool[] {
  const includeAll = groups.includes('all');

  const toolCreators: Array<() => Record<string, ADKTool>> = [];

  if (includeAll || groups.includes('sites'))
    toolCreators.push(() => mapGroup(createSiteTools(kit.client)));
  if (includeAll || groups.includes('pages'))
    toolCreators.push(() => mapGroup(createPageTools(kit.client)));
  if (includeAll || groups.includes('cms'))
    toolCreators.push(() => mapGroup(createCmsTools(kit.client)));
  if (includeAll || groups.includes('collections'))
    toolCreators.push(() => mapGroup(createCollectionTools(kit.client)));
  if (includeAll || groups.includes('assets'))
    toolCreators.push(() => mapGroup(createAssetTools(kit.client)));
  if (includeAll || groups.includes('forms'))
    toolCreators.push(() => mapGroup(createFormTools(kit.client)));
  if (includeAll || groups.includes('custom-code'))
    toolCreators.push(() => mapGroup(createCustomCodeTools(kit.client)));
  if (includeAll || groups.includes('redirects'))
    toolCreators.push(() => mapGroup(createRedirectTools(kit.client)));
  if (includeAll || groups.includes('seo'))
    toolCreators.push(() => mapGroup(createSeoTools(kit.client)));
  if (includeAll || groups.includes('webhooks'))
    toolCreators.push(() => mapGroup(createWebhookTools(kit.client)));
  if (includeAll || groups.includes('products'))
    toolCreators.push(() => mapGroup(createProductTools(kit.client)));
  if (includeAll || groups.includes('orders'))
    toolCreators.push(() => mapGroup(createOrderTools(kit.client)));
  if (includeAll || groups.includes('inventory'))
    toolCreators.push(() => mapGroup(createInventoryTools(kit.client)));
  if (includeAll || groups.includes('audit-logs'))
    toolCreators.push(() => mapGroup(createAuditLogTools(kit.client)));
  if (includeAll || groups.includes('components'))
    toolCreators.push(() => mapGroup(createComponentTools(kit.client)));

  const tools: ADKTool[] = [];
  for (const creator of toolCreators) {
    const groupTools = creator();
    for (const tool of Object.values(groupTools)) {
      tools.push(tool);
    }
  }
  return tools;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapGroup(group: Record<string, any>): Record<string, ADKTool> {
  const result: Record<string, ADKTool> = {};
  for (const [key, tool] of Object.entries(group)) {
    result[key] = {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
      execute: tool.execute,
    };
  }
  return result;
}
