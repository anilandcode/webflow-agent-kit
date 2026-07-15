import { z } from 'zod';
import type { WebflowClient } from 'webflow-api';

export function createListPagesTool(client: WebflowClient) {
  return {
    name: 'webflow_list_pages',
    description:
      'List all pages in a Webflow site. Returns page IDs, titles, slugs, and SEO metadata.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
      limit: z.number().min(1).max(100).optional().default(100),
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
      const response = await client.pages.list(siteId, { limit, offset });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pages = (response as any).pages ?? [];
      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pages: pages.map((p: any) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          localeId: p.localeId,
        })),
      };
    },
  };
}

export function createGetPageMetadataTool(client: WebflowClient) {
  return {
    name: 'webflow_get_page_metadata',
    description:
      'Get the metadata for a specific page, including its SEO title, description, open graph settings, and custom code.',
    inputSchema: z.object({
      pageId: z.string().describe('The page ID'),
    }),
    execute: async ({ pageId }: { pageId: string }) => {
      const metadata = await client.pages.getMetadata(pageId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const m = metadata as any;
      return {
        id: m.id,
        title: m.title,
        slug: m.slug,
        seo: m.seo,
        openGraph: m.openGraph,
        localeId: m.localeId,
      };
    },
  };
}

export function createUpdatePageMetadataTool(client: WebflowClient) {
  return {
    name: 'webflow_update_page_metadata',
    description:
      'Update a page SEO title, meta description, and Open Graph settings. Use this for bulk SEO optimization workflows.',
    inputSchema: z.object({
      pageId: z.string().describe('The page ID to update'),
      seo: z
        .object({
          title: z.string().optional().describe('SEO title tag'),
          description: z
            .string()
            .optional()
            .describe('Meta description (max 320 characters recommended)'),
        })
        .optional(),
      openGraph: z
        .object({
          title: z.string().optional(),
          description: z.string().optional(),
        })
        .optional(),
    }),
    execute: async ({
      pageId,
      seo,
      openGraph,
    }: {
      pageId: string;
      seo?: { title?: string; description?: string };
      openGraph?: { title?: string; description?: string };
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const request: any = {};
      if (seo) request.seo = seo;
      if (openGraph) request.openGraph = openGraph;
      await client.pages.updatePageSettings(pageId, request);
      return { updated: true, pageId };
    },
  };
}

export function createUpdateStaticContentTool(client: WebflowClient) {
  return {
    name: 'webflow_update_static_content',
    description:
      'Update static (non-CMS) page content. Use this to modify text, images, or other elements on static pages.',
    inputSchema: z.object({
      pageId: z.string().describe('The page ID'),
      localeId: z.string().describe('The locale ID for the target locale'),
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
      pageId,
      localeId,
      nodes,
    }: {
      pageId: string;
      localeId: string;
      nodes: Array<{ nodeId: string; text?: string }>;
    }) => {
      await client.pages.updateStaticContent(pageId, { localeId, nodes });
      return { updated: true, pageId, nodesUpdated: nodes.length };
    },
  };
}

export function createPageTools(client: WebflowClient) {
  return {
    listPages: createListPagesTool(client),
    getPageMetadata: createGetPageMetadataTool(client),
    updatePageMetadata: createUpdatePageMetadataTool(client),
    updateStaticContent: createUpdateStaticContentTool(client),
  };
}
