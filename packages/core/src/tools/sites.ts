import { z } from 'zod';
import type { WebflowClient } from 'webflow-api';

export function createListSitesTool(client: WebflowClient) {
  return {
    name: 'webflow_list_sites',
    description:
      'List all Webflow sites in your workspace. Returns site IDs, names, domains, and published status.',
    inputSchema: z.object({
      limit: z
        .number()
        .min(1)
        .max(100)
        .optional()
        .default(50)
        .describe('Max sites to return (1-100)'),
      offset: z.number().min(0).optional().default(0).describe('Pagination offset'),
    }),
    execute: async ({ limit, offset }: { limit: number; offset: number }) => {
      const response = await client.sites.list();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sites = (response as any).sites ?? [];
      return {
        sites: sites.slice(offset, offset + limit).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (s: any) => ({
            id: s.id,
            displayName: s.displayName,
            shortName: s.shortName,
            previewUrl: s.previewUrl,
            lastPublished: s.lastPublished,
            timeZone: s.timeZone,
            customDomains: s.customDomains,
          }),
        ),
      };
    },
  };
}

export function createGetSiteTool(client: WebflowClient) {
  return {
    name: 'webflow_get_site',
    description:
      'Get detailed information about a specific Webflow site by its ID. Returns the site name, domains, workspace, and custom domains.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID (e.g., 64a1c7e5f3b2a1c7e5f3b2a1)'),
    }),
    execute: async ({ siteId }: { siteId: string }) => {
      const site = await client.sites.get(siteId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const s = site as any;
      return {
        id: s.id,
        displayName: s.displayName,
        shortName: s.shortName,
        previewUrl: s.previewUrl,
        lastPublished: s.lastPublished,
        workspaceId: s.workspaceId,
        customDomains: s.customDomains,
        timeZone: s.timeZone,
      };
    },
  };
}

export function createPublishSiteTool(client: WebflowClient) {
  return {
    name: 'webflow_publish_site',
    description:
      'Publish a Webflow site. Optionally publish only specific domains. After publishing, your changes are live on the published domains.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID to publish'),
      publishToWebflowSubdomain: z
        .boolean()
        .optional()
        .default(true)
        .describe('Publish to the .webflow.io subdomain'),
    }),
    execute: async ({
      siteId,
      publishToWebflowSubdomain,
    }: {
      siteId: string;
      publishToWebflowSubdomain: boolean;
    }) => {
      await client.sites.publish(siteId, { publishToWebflowSubdomain });
      return { published: true, siteId };
    },
  };
}

export function createGetCustomDomainsTool(client: WebflowClient) {
  return {
    name: 'webflow_get_custom_domains',
    description: 'Get all custom domains configured for a Webflow site.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
    }),
    execute: async ({ siteId }: { siteId: string }) => {
      const domains = await client.sites.getCustomDomain(siteId);
      return { customDomains: domains };
    },
  };
}

export function createSiteTools(client: WebflowClient) {
  return {
    listSites: createListSitesTool(client),
    getSite: createGetSiteTool(client),
    publishSite: createPublishSiteTool(client),
    getCustomDomains: createGetCustomDomainsTool(client),
  };
}
