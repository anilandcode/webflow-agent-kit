import { z } from 'zod';
import type { WebflowClient } from 'webflow-api';

export function createListCollectionsTool(client: WebflowClient) {
  return {
    name: 'webflow_list_collections',
    description:
      'List all CMS collections in a Webflow site. Collections are where CMS content (blog posts, products, etc.) is stored.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
    }),
    execute: async ({ siteId }: { siteId: string }) => {
      const response = await client.collections.list(siteId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const collections = (response as any).collections ?? [];
      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        collections: collections.map((c: any) => ({
          id: c.id,
          displayName: c.displayName,
          singularName: c.singularName,
          slug: c.slug,
          createdOn: c.createdOn,
          lastUpdated: c.lastUpdated,
        })),
      };
    },
  };
}

export function createGetCollectionTool(client: WebflowClient) {
  return {
    name: 'webflow_get_collection',
    description:
      'Get full details of a CMS collection, including all its fields, schema, and settings.',
    inputSchema: z.object({
      collectionId: z.string().describe('The collection ID'),
    }),
    execute: async ({ collectionId }: { collectionId: string }) => {
      const collection = await client.collections.get(collectionId);
      return { collection };
    },
  };
}

export function createCollectionTools(client: WebflowClient) {
  return {
    listCollections: createListCollectionsTool(client),
    getCollection: createGetCollectionTool(client),
  };
}
