import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import type { WebflowAgentKit } from '@webflow-agent-kit/core';
import {
  createSiteTools,
  createPageTools,
  createCmsTools,
  createCollectionTools,
} from '@webflow-agent-kit/core';

type ToolGroup = 'sites' | 'pages' | 'cms' | 'collections' | 'all';

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

export function toLangChainTools(
  kit: WebflowAgentKit,
  groups: ToolGroup[] = ['all'],
): DynamicStructuredTool[] {
  const includeAll = groups.includes('all');

  const toolGroups: Record<string, Record<string, CoreTool>> = {};

  if (includeAll || groups.includes('sites')) {
    toolGroups.sites = createSiteTools(kit.client) as unknown as Record<string, CoreTool>;
  }
  if (includeAll || groups.includes('pages')) {
    toolGroups.pages = createPageTools(kit.client) as unknown as Record<string, CoreTool>;
  }
  if (includeAll || groups.includes('cms')) {
    toolGroups.cms = createCmsTools(kit.client) as unknown as Record<string, CoreTool>;
  }
  if (includeAll || groups.includes('collections')) {
    toolGroups.collections = createCollectionTools(kit.client) as unknown as Record<string, CoreTool>;
  }

  const tools: CoreTool[] = [];
  for (const group of Object.values(toolGroups)) {
    for (const tool of Object.values(group)) {
      tools.push(tool);
    }
  }

  return tools.map(coreToLangChainTool);
}
