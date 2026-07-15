import type { WebflowAgentKit } from '@webflow-agent-kit/core';
import {
  createSiteTools,
  createPageTools,
  createCmsTools,
  createCollectionTools,
} from '@webflow-agent-kit/core';

type ToolGroup = 'sites' | 'pages' | 'cms' | 'collections' | 'all';

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

export function toVercelAITools(
  kit: WebflowAgentKit,
  groups: ToolGroup[] = ['all'],
): Record<string, ReturnType<typeof toVercelTool>> {
  const includeAll = groups.includes('all');

  const toolGroups: Record<string, Record<string, CoreToolDefinition>> = {};

  if (includeAll || groups.includes('sites')) {
    toolGroups.sites = createSiteTools(kit.client) as unknown as Record<
      string,
      CoreToolDefinition
    >;
  }
  if (includeAll || groups.includes('pages')) {
    toolGroups.pages = createPageTools(kit.client) as unknown as Record<
      string,
      CoreToolDefinition
    >;
  }
  if (includeAll || groups.includes('cms')) {
    toolGroups.cms = createCmsTools(kit.client) as unknown as Record<string, CoreToolDefinition>;
  }
  if (includeAll || groups.includes('collections')) {
    toolGroups.collections = createCollectionTools(kit.client) as unknown as Record<
      string,
      CoreToolDefinition
    >;
  }

  const allTools = flattenTools(toolGroups);

  const result: Record<string, ReturnType<typeof toVercelTool>> = {};
  for (const tool of allTools) {
    result[tool.name] = toVercelTool(tool);
  }
  return result;
}
