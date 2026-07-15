import { z } from 'zod';
import type { WebflowClient } from 'webflow-api';
import { chunkItems } from '../bulk.js';

export function createListItemsTool(client: WebflowClient) {
  return {
    name: 'webflow_list_cms_items',
    description:
      'List staged (draft/unpublished) CMS items in a collection. Used for content that has NOT been published yet. For published/live content visible on the site, use webflow_list_live_cms_items instead.',
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
      'Get a single staged CMS item by its ID. Returns the item field data and metadata. For the published version, use webflow_get_live_cms_item.',
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
      'Create one or more CMS items in a collection. Items are created as staged drafts by default (not live). Use publishImmediately=true to publish them right away, or call webflow_publish_cms_items separately after review. Supports creating up to 100 items per call — if you have more, make multiple calls in sequence.',
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
        .describe('Array of items to create (up to 100 recommended, batches handled automatically)'),
      publishImmediately: z
        .boolean()
        .optional()
        .default(false)
        .describe('Publish items immediately after creation'),
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
      const chunks = chunkItems(items, 100);
      const allCreated: unknown[] = [];

      for (const chunk of chunks) {
        const itemsPayload = chunk.map((i) => ({ fieldData: i.fieldData, isDraft: i.isDraft }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const created = await client.collections.items.createItem(collectionId, { items: itemsPayload } as any);
        allCreated.push(created);
      }

      if (publishImmediately) {
        for (const chunk of chunks) {
          const ids = chunk
            .map((_, i) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const resp = allCreated[chunks.indexOf(chunk)] as any;
              const createdItems = resp?.items ?? [resp];
              return createdItems[i]?.id;
            })
            .filter(Boolean) as string[];
          if (ids.length > 0) {
            await client.collections.items.publishItem(collectionId, { itemIds: ids });
          }
        }
      }

      return { created: items.length, batches: chunks.length, results: allCreated };
    },
  };
}

export function createUpdateItemsTool(client: WebflowClient) {
  return {
    name: 'webflow_update_cms_items',
    description:
      'Update staged CMS items by their IDs. Pass each item ID and the field data to change. Only include fields you want to modify — other fields will not be affected. Supports up to 100 items per call, automatically batched if you pass more.',
    inputSchema: z.object({
      collectionId: z.string().describe('The Webflow collection ID'),
      items: z
        .array(
          z.object({
            id: z.string().describe('The item ID to update'),
            fieldData: z
              .record(z.unknown())
              .describe('Updated field data (only include fields you want to change)'),
          }),
        )
        .describe('Array of items to update (auto-batched if >100)'),
      publishImmediately: z
        .boolean()
        .optional()
        .default(false)
        .describe('Publish the updated items immediately'),
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
      const chunks = chunkItems(items, 100);
      const results: unknown[] = [];

      for (const chunk of chunks) {
        const result = await client.collections.items.updateItems(collectionId, {
          items: chunk.map((i) => ({ id: i.id, fieldData: i.fieldData })),
        });
        results.push(result);
      }

      if (publishImmediately) {
        for (const chunk of chunks) {
          await client.collections.items.publishItem(collectionId, {
            itemIds: chunk.map((i) => i.id),
          });
        }
      }

      return { updated: items.length, batches: chunks.length, results };
    },
  };
}

export function createDeleteItemsTool(client: WebflowClient) {
  return {
    name: 'webflow_delete_cms_items',
    description:
      'Delete one or more staged CMS items by their IDs. This action cannot be undone. Auto-batched if you pass more than 100 IDs.',
    inputSchema: z.object({
      collectionId: z.string().describe('The Webflow collection ID'),
      itemIds: z.array(z.string()).describe('Array of item IDs to delete (auto-batched if >100)'),
    }),
    execute: async ({
      collectionId,
      itemIds,
    }: {
      collectionId: string;
      itemIds: string[];
    }) => {
      const chunks = chunkItems(itemIds, 100);
      for (const chunk of chunks) {
        await client.collections.items.deleteItems(collectionId, {
          items: chunk.map((id) => ({ id })),
        });
      }
      return { deleted: itemIds.length, batches: chunks.length };
    },
  };
}

export function createPublishItemsTool(client: WebflowClient) {
  return {
    name: 'webflow_publish_cms_items',
    description:
      'Publish staged/draft CMS items to make them live on the site. Use after creating items with isDraft=true or after updating staged content. Auto-batched if you pass more than 100 IDs.',
    inputSchema: z.object({
      collectionId: z.string().describe('The Webflow collection ID'),
      itemIds: z.array(z.string()).describe('Item IDs to publish (auto-batched if >100)'),
    }),
    execute: async ({
      collectionId,
      itemIds,
    }: {
      collectionId: string;
      itemIds: string[];
    }) => {
      const chunks = chunkItems(itemIds, 100);
      for (const chunk of chunks) {
        await client.collections.items.publishItem(collectionId, { itemIds: chunk });
      }
      return { published: itemIds.length, batches: chunks.length };
    },
  };
}

export function createListLiveItemsTool(client: WebflowClient) {
  return {
    name: 'webflow_list_live_cms_items',
    description:
      'List published/live CMS items visible on the site. Use this to read content your site visitors see. For draft/staged items, use webflow_list_cms_items instead.',
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
