import { z } from 'zod';
import type { WebflowClient } from 'webflow-api';

export function createListItemsTool(client: WebflowClient) {
  return {
    name: 'webflow_list_cms_items',
    description:
      'List all CMS items (staged) in a collection. Use this to browse content before publishing. For live/published content, use webflow_list_live_cms_items.',
    inputSchema: z.object({
      collectionId: z.string().describe('The Webflow collection ID'),
      limit: z.number().min(1).max(100).optional().default(100),
      offset: z.number().min(0).optional().default(0),
    }),
    execute: async ({
      collectionId,
      limit,
      offset,
    }: {
      collectionId: string;
      limit: number;
      offset: number;
    }) => {
      const response = await client.collections.items.listItems(collectionId, {
        limit,
        offset,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = response as any;
      return {
        items: r.items ?? [],
        pagination: r.pagination,
      };
    },
  };
}

export function createGetItemTool(client: WebflowClient) {
  return {
    name: 'webflow_get_cms_item',
    description:
      'Get a single CMS item (staged) by its ID. Returns the item field data and metadata.',
    inputSchema: z.object({
      collectionId: z.string().describe('The Webflow collection ID'),
      itemId: z.string().describe('The CMS item ID'),
    }),
    execute: async ({ collectionId, itemId }: { collectionId: string; itemId: string }) => {
      const item = await client.collections.items.getItem(collectionId, itemId);
      return { item };
    },
  };
}

export function createCreateItemsTool(client: WebflowClient) {
  return {
    name: 'webflow_create_cms_items',
    description:
      'Create one or more items in a Webflow CMS collection. Use this to add new blog posts, products, team members, or any other CMS content. Returns the created item IDs.',
    inputSchema: z.object({
      collectionId: z.string().describe('The Webflow collection ID'),
      items: z
        .array(
          z.object({
            fieldData: z
              .record(z.unknown())
              .describe('Key-value pairs matching collection field slugs'),
            isDraft: z.boolean().optional().default(true).describe('Whether to create as draft'),
          }),
        )
        .max(100)
        .describe('Array of items to create (max 100)'),
      publishImmediately: z
        .boolean()
        .optional()
        .default(false)
        .describe('Publish items after creation'),
    }),
    execute: async ({
      collectionId,
      items,
      publishImmediately,
    }: {
      collectionId: string;
      items: Array<{ fieldData: Record<string, unknown>; isDraft?: boolean }>;
      publishImmediately: boolean;
    }) => {
      const itemsPayload = items.map((i) => ({ fieldData: i.fieldData, isDraft: i.isDraft }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const created = await client.collections.items.createItem(collectionId, { items: itemsPayload } as any);
      if (publishImmediately) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ids = ((created as any).items ?? [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((i: any) => i.id)
          .filter(Boolean) as string[];
        if (ids.length > 0) {
          await client.collections.items.publishItem(collectionId, { itemIds: ids });
        }
      }
      return { created };
    },
  };
}

export function createUpdateItemsTool(client: WebflowClient) {
  return {
    name: 'webflow_update_cms_items',
    description:
      'Update one or more CMS items by their IDs. Pass the item ID and the field data to change.',
    inputSchema: z.object({
      collectionId: z.string().describe('The Webflow collection ID'),
      items: z
        .array(
          z.object({
            id: z.string().describe('The item ID to update'),
            fieldData: z
              .record(z.unknown())
              .describe('Updated field data (only fields you want to change)'),
          }),
        )
        .max(100),
      publishImmediately: z.boolean().optional().default(false),
    }),
    execute: async ({
      collectionId,
      items,
      publishImmediately,
    }: {
      collectionId: string;
      items: Array<{ id: string; fieldData: Record<string, unknown> }>;
      publishImmediately: boolean;
    }) => {
      const updated = await client.collections.items.updateItems(collectionId, {
        items: items.map((i) => ({ id: i.id, fieldData: i.fieldData })),
      });
      if (publishImmediately) {
        const ids = items.map((i) => i.id);
        await client.collections.items.publishItem(collectionId, { itemIds: ids });
      }
      return { updated };
    },
  };
}

export function createDeleteItemsTool(client: WebflowClient) {
  return {
    name: 'webflow_delete_cms_items',
    description: 'Delete one or more CMS items by their IDs. This action cannot be undone.',
    inputSchema: z.object({
      collectionId: z.string().describe('The Webflow collection ID'),
      itemIds: z.array(z.string()).max(100).describe('Array of item IDs to delete'),
    }),
    execute: async ({
      collectionId,
      itemIds,
    }: {
      collectionId: string;
      itemIds: string[];
    }) => {
      await client.collections.items.deleteItems(collectionId, {
        items: itemIds.map((id) => ({ id })),
      });
      return { deleted: itemIds.length };
    },
  };
}

export function createPublishItemsTool(client: WebflowClient) {
  return {
    name: 'webflow_publish_cms_items',
    description:
      'Publish staged CMS items to make them live. Use after creating or updating items with isDraft: true.',
    inputSchema: z.object({
      collectionId: z.string().describe('The Webflow collection ID'),
      itemIds: z.array(z.string()).max(100).describe('Item IDs to publish'),
    }),
    execute: async ({
      collectionId,
      itemIds,
    }: {
      collectionId: string;
      itemIds: string[];
    }) => {
      await client.collections.items.publishItem(collectionId, { itemIds });
      return { published: itemIds.length };
    },
  };
}

export function createListLiveItemsTool(client: WebflowClient) {
  return {
    name: 'webflow_list_live_cms_items',
    description:
      'List all live (published) CMS items in a collection. Use this to read published content.',
    inputSchema: z.object({
      collectionId: z.string().describe('The Webflow collection ID'),
      limit: z.number().min(1).max(100).optional().default(100),
      offset: z.number().min(0).optional().default(0),
    }),
    execute: async ({
      collectionId,
      limit,
      offset,
    }: {
      collectionId: string;
      limit: number;
      offset: number;
    }) => {
      const response = await client.collections.items.listItemsLive(collectionId, {
        limit,
        offset,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = response as any;
      return {
        items: r.items ?? [],
        pagination: r.pagination,
      };
    },
  };
}

export function createCmsTools(client: WebflowClient) {
  return {
    listItems: createListItemsTool(client),
    getItem: createGetItemTool(client),
    createItems: createCreateItemsTool(client),
    updateItems: createUpdateItemsTool(client),
    deleteItems: createDeleteItemsTool(client),
    publishItems: createPublishItemsTool(client),
    listLiveItems: createListLiveItemsTool(client),
  };
}
