import { z } from 'zod';
import type { WebflowClient } from 'webflow-api';

export function createGetCustomCodeTool(client: WebflowClient) {
  return {
    name: 'webflow_get_custom_code',
    description:
      'Get all custom code scripts applied to a site. Returns both header and footer scripts with their versions and attributes.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
    }),
    execute: async ({ siteId }: { siteId: string }) => {
      const scripts = await client.sites.scripts.getCustomCode(siteId);
      return { scripts };
    },
  };
}

export function createUpsertCustomCodeTool(client: WebflowClient) {
  return {
    name: 'webflow_upsert_custom_code',
    description:
      'Add or update custom code scripts on a site. Pass all scripts you want applied — any scripts not included in the request will be removed. Each script requires an ID, location (header or footer), and version.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
      scripts: z
        .array(
          z.object({
            id: z.string().describe('Script identifier (e.g., "analytics", "chat-widget")'),
            location: z.enum(['header', 'footer']).describe('Where to inject the script'),
            version: z.string().describe('Script version string'),
            attributes: z.record(z.string()).optional().describe('Additional attributes for the script'),
          }),
        )
        .describe('Array of scripts to apply'),
    }),
    execute: async ({
      siteId,
      scripts,
    }: {
      siteId: string;
      scripts: Array<{ id: string; location: string; version: string; attributes?: Record<string, string> }>;
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await client.sites.scripts.upsertCustomCode(siteId, { scripts } as any);
      return { applied: scripts.length, scripts };
    },
  };
}

export function createDeleteCustomCodeTool(client: WebflowClient) {
  return {
    name: 'webflow_delete_custom_code',
    description: 'Remove all custom code scripts from a site. Use with caution — this removes all scripts applied by your app.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
    }),
    execute: async ({ siteId }: { siteId: string }) => {
      await client.sites.scripts.deleteCustomCode(siteId);
      return { deleted: true, siteId };
    },
  };
}

export function createCustomCodeTools(client: WebflowClient) {
  return {
    getCustomCode: createGetCustomCodeTool(client),
    upsertCustomCode: createUpsertCustomCodeTool(client),
    deleteCustomCode: createDeleteCustomCodeTool(client),
  };
}
