import { z } from 'zod';
import type { WebflowClient } from 'webflow-api';

export function createListRedirectsTool(client: WebflowClient) {
  return {
    name: 'webflow_list_redirects',
    description:
      'List all 301 redirect rules for a site. Each redirect maps a fromUrl to a toUrl. ⚠️ Enterprise only.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
    }),
    execute: async ({ siteId }: { siteId: string }) => {
      const response = await client.sites.redirects.list(siteId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const redirects = (response as any).redirects ?? [];
      return { redirects };
    },
  };
}

export function createCreateRedirectTool(client: WebflowClient) {
  return {
    name: 'webflow_create_redirect',
    description:
      'Add a new 301 redirect rule. Maps a source path to a destination path. Useful for URL restructuring and SEO migrations. ⚠️ Enterprise only.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
      fromUrl: z.string().describe('The source URL path (e.g., /old-page)'),
      toUrl: z.string().describe('The destination URL path (e.g., /new-page)'),
    }),
    execute: async ({
      siteId,
      fromUrl,
      toUrl,
    }: {
      siteId: string;
      fromUrl: string;
      toUrl: string;
    }) => {
      const redirect = await client.sites.redirects.create(siteId, { fromUrl, toUrl });
      return { redirect };
    },
  };
}

export function createDeleteRedirectTool(client: WebflowClient) {
  return {
    name: 'webflow_delete_redirect',
    description: 'Delete a 301 redirect rule. ⚠️ Enterprise only.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
      redirectId: z.string().describe('The redirect ID to delete'),
    }),
    execute: async ({ siteId, redirectId }: { siteId: string; redirectId: string }) => {
      await client.sites.redirects.delete(siteId, redirectId);
      return { deleted: true, redirectId };
    },
  };
}

export function createRedirectTools(client: WebflowClient) {
  return {
    listRedirects: createListRedirectsTool(client),
    createRedirect: createCreateRedirectTool(client),
    deleteRedirect: createDeleteRedirectTool(client),
  };
}
