import { z } from 'zod';
import type { WebflowClient } from 'webflow-api';

export function createListComponentsTool(client: WebflowClient) {
  return {
    name: 'webflow_list_components',
    description:
      'List all components in a site. Components are reusable element structures (headers, footers, cards, etc.) that can be embedded across multiple pages.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
      limit: z.number().min(1).max(100).optional().default(50),
      offset: z.number().min(0).optional().default(0),
    }),
    execute: async ({
      siteId,
      limit,
      offset,
    }: {
      siteId: string;
      limit: number;
      offset: number;
    }) => {
      const response = await client.components.list(siteId, { limit, offset });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const components = (response as any).components ?? [];
      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        components: components.map((c: any) => ({
          id: c.id,
          name: c.name,
          displayName: c.displayName,
        })),
      };
    },
  };
}

export function createGetComponentContentTool(client: WebflowClient) {
  return {
    name: 'webflow_get_component_content',
    description:
      'Get the static content of a component definition. Returns text nodes, image nodes, select nodes, and nested component instances. Includes locale support via localeId.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
      componentId: z.string().describe('The component ID'),
      localeId: z.string().optional().describe('Specific locale ID for localized content'),
    }),
    execute: async ({
      siteId,
      componentId,
      localeId,
    }: {
      siteId: string;
      componentId: string;
      localeId?: string;
    }) => {
      const content = await client.components.getContent(siteId, componentId, { localeId });
      return { content };
    },
  };
}

export function createUpdateComponentContentTool(client: WebflowClient) {
  return {
    name: 'webflow_update_component_content',
    description:
      'Update static content within a component definition in secondary locales. Supports updating up to 1000 nodes. Use getComponentContent first to identify available nodes.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
      componentId: z.string().describe('The component ID'),
      localeId: z.string().describe('Target secondary locale ID'),
      nodes: z
        .array(
          z.object({
            nodeId: z.string().describe('The DOM node ID to update'),
            text: z.string().optional().describe('HTML text content to set'),
          }),
        )
        .describe('Array of content nodes to update'),
    }),
    execute: async ({
      siteId,
      componentId,
      localeId,
      nodes,
    }: {
      siteId: string;
      componentId: string;
      localeId: string;
      nodes: Array<{ nodeId: string; text?: string }>;
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await client.components.updateContent(siteId, componentId, { localeId, nodes } as any);
      return { updated: true, componentId, nodesUpdated: nodes.length };
    },
  };
}

export function createGetComponentPropertiesTool(client: WebflowClient) {
  return {
    name: 'webflow_get_component_properties',
    description:
      'Get the dynamic properties of a component definition. Properties are the editable fields users see when configuring a component instance in the Designer.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
      componentId: z.string().describe('The component ID'),
    }),
    execute: async ({
      siteId,
      componentId,
    }: {
      siteId: string;
      componentId: string;
    }) => {
      const properties = await client.components.getProperties(siteId, componentId);
      return { properties };
    },
  };
}

export function createUpdateComponentPropertiesTool(client: WebflowClient) {
  return {
    name: 'webflow_update_component_properties',
    description:
      'Update the dynamic properties of a component definition. Each property has an ID and can accept text, image, or other content types.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
      componentId: z.string().describe('The component ID'),
      properties: z
        .array(
          z.object({
            propertyId: z.string().describe('The property ID to update'),
            text: z.string().optional().describe('HTML text content for the property'),
          }),
        )
        .describe('Array of properties to update'),
    }),
    execute: async ({
      siteId,
      componentId,
      properties,
    }: {
      siteId: string;
      componentId: string;
      properties: Array<{ propertyId: string; text?: string }>;
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await client.components.updateProperties(siteId, componentId, { properties } as any);
      return { updated: true, componentId, propertiesUpdated: properties.length };
    },
  };
}

export function createComponentTools(client: WebflowClient) {
  return {
    listComponents: createListComponentsTool(client),
    getComponentContent: createGetComponentContentTool(client),
    updateComponentContent: createUpdateComponentContentTool(client),
    getComponentProperties: createGetComponentPropertiesTool(client),
    updateComponentProperties: createUpdateComponentPropertiesTool(client),
  };
}
