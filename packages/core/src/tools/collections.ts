import { z } from 'zod';
import type { WebflowClient } from 'webflow-api';

export function createListCollectionsTool(client: WebflowClient) {
  return {
    name: 'webflow_list_collections',
    description:
      'List all CMS collections in a site. Use this to discover available collections before working with their items. Each collection has an ID you will need for item operations.',
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
      'Get full details of a CMS collection, including all its fields, schema, and settings. Useful before creating items to understand what fields are available.',
    inputSchema: z.object({
      collectionId: z.string().describe('The collection ID'),
    }),
    execute: async ({ collectionId }: { collectionId: string }) => {
      const collection = await client.collections.get(collectionId);
      return { collection };
    },
  };
}

export function createFieldTool(client: WebflowClient) {
  return {
    name: 'webflow_create_collection_field',
    description:
      'Create a new custom field in a CMS collection. Field types include: PlainText, RichText, Number, Option (dropdown), Reference (to another collection), Image, Video, Color, File, Link, Email, Phone, Switch, and more.',
    inputSchema: z.object({
      collectionId: z.string().describe('The collection ID to add the field to'),
      type: z
        .enum([
          'PlainText',
          'RichText',
          'Number',
          'Option',
          'Reference',
          'Image',
          'Video',
          'Color',
          'File',
          'Link',
          'Email',
          'Phone',
          'Switch',
        ])
        .describe('The field type'),
      displayName: z.string().describe('Display name for the field (human-readable)'),
      helpText: z.string().optional().describe('Help text shown in the CMS editor'),
      isRequired: z.boolean().optional().default(false).describe('Whether this field is required'),
      isEditable: z.boolean().optional().default(true).describe('Whether this field is editable'),
      metadata: z
        .object({
          options: z
            .array(z.object({ name: z.string() }))
            .optional()
            .describe('Options array for Option type fields'),
          collectionId: z
            .string()
            .optional()
            .describe('Target collection ID for Reference type fields'),
        })
        .optional()
        .describe('Type-specific metadata'),
    }),
    execute: async ({
      collectionId,
      type,
      displayName,
      helpText,
      isRequired,
      isEditable,
      metadata,
    }: {
      collectionId: string;
      type: string;
      displayName: string;
      helpText?: string;
      isRequired: boolean;
      isEditable: boolean;
      metadata?: { options?: Array<{ name: string }>; collectionId?: string };
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const request: any = {
        type,
        displayName,
        isRequired,
        isEditable,
      };
      if (helpText) request.helpText = helpText;
      if (metadata) request.metadata = metadata;
      const field = await client.collections.fields.create(collectionId, request);
      return { field };
    },
  };
}

export function createUpdateFieldTool(client: WebflowClient) {
  return {
    name: 'webflow_update_collection_field',
    description:
      'Update an existing custom field in a CMS collection. Change display name, help text, or whether it is required.',
    inputSchema: z.object({
      collectionId: z.string().describe('The collection ID'),
      fieldId: z.string().describe('The field ID to update'),
      displayName: z.string().optional().describe('New display name'),
      helpText: z.string().optional().describe('New help text'),
      isRequired: z.boolean().optional().describe('Change whether field is required'),
    }),
    execute: async ({
      collectionId,
      fieldId,
      displayName,
      helpText,
      isRequired,
    }: {
      collectionId: string;
      fieldId: string;
      displayName?: string;
      helpText?: string;
      isRequired?: boolean;
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const request: any = {};
      if (displayName !== undefined) request.displayName = displayName;
      if (helpText !== undefined) request.helpText = helpText;
      if (isRequired !== undefined) request.isRequired = isRequired;
      const field = await client.collections.fields.update(collectionId, fieldId, request);
      return { field };
    },
  };
}

export function createDeleteFieldTool(client: WebflowClient) {
  return {
    name: 'webflow_delete_collection_field',
    description:
      'Delete a custom field from a CMS collection. This removes the field and all its data from every item in the collection. Cannot be undone.',
    inputSchema: z.object({
      collectionId: z.string().describe('The collection ID'),
      fieldId: z.string().describe('The field ID to delete'),
    }),
    execute: async ({
      collectionId,
      fieldId,
    }: {
      collectionId: string;
      fieldId: string;
    }) => {
      await client.collections.fields.delete(collectionId, fieldId);
      return { deleted: true, fieldId };
    },
  };
}

export function createCollectionTools(client: WebflowClient) {
  return {
    listCollections: createListCollectionsTool(client),
    getCollection: createGetCollectionTool(client),
    createField: createFieldTool(client),
    updateField: createUpdateFieldTool(client),
    deleteField: createDeleteFieldTool(client),
  };
}
