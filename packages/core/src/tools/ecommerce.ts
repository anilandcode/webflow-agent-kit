import { z } from 'zod';
import type { WebflowClient } from 'webflow-api';

export function createListProductsTool(client: WebflowClient) {
  return {
    name: 'webflow_list_products',
    description:
      'List all ecommerce products for a site, including their SKUs. Use pagination for large catalogs.',
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
      const response = await client.products.list(siteId, { limit, offset });
      return response;
    },
  };
}

export function createGetProductTool(client: WebflowClient) {
  return {
    name: 'webflow_get_product',
    description: 'Get a single product with all its SKUs and field data.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
      productId: z.string().describe('The product ID'),
    }),
    execute: async ({ siteId, productId }: { siteId: string; productId: string }) => {
      const product = await client.products.get(siteId, productId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = product as any;
      return {
        product: p.product ?? p,
        skus: p.skus ?? [],
      };
    },
  };
}

export function createCreateProductTool(client: WebflowClient) {
  return {
    name: 'webflow_create_product',
    description:
      'Create a new ecommerce product with a default SKU. Products require at minimum a name, slug, and price. Optionally add skuProperties for variants (size, color, etc.).',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
      name: z.string().describe('Product name'),
      slug: z.string().describe('URL-friendly slug'),
      price: z.number().positive().describe('Price in cents (e.g., 2499 for $24.99)'),
      currency: z.string().optional().default('USD').describe('Currency code'),
      description: z.string().optional().describe('Product description'),
      mainImage: z.string().url().optional().describe('Main image URL'),
      skuProperties: z
        .array(
          z.object({
            id: z.string().describe('Property ID (e.g., "color")'),
            name: z.string().describe('Property display name (e.g., "Color")'),
            enum: z
              .array(z.object({ id: z.string(), name: z.string(), slug: z.string() }))
              .describe('Array of variant values'),
          }),
        )
        .optional()
        .describe('Product variant options'),
      publishStatus: z
        .enum(['staging', 'live'])
        .optional()
        .default('staging')
        .describe('Publish status'),
    }),
    execute: async ({
      siteId,
      name,
      slug,
      price,
      currency,
      description,
      mainImage,
      skuProperties,
      publishStatus,
    }: {
      siteId: string;
      name: string;
      slug: string;
      price: number;
      currency: string;
      description?: string;
      mainImage?: string;
      skuProperties?: Array<{
        id: string;
        name: string;
        enum: Array<{ id: string; name: string; slug: string }>;
      }>;
      publishStatus: string;
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const request: any = {
        publishStatus,
        product: {
          fieldData: {
            name,
            slug,
            ...(description && { description }),
            ...(skuProperties && { skuProperties }),
          },
        },
        sku: {
          fieldData: {
            name,
            slug,
            price: { value: price, unit: currency, currency },
            ...(mainImage && { mainImage }),
          },
        },
      };
      const result = await client.products.create(siteId, request);
      return result;
    },
  };
}

export function createUpdateProductTool(client: WebflowClient) {
  return {
    name: 'webflow_update_product',
    description: 'Update an existing product. Change name, slug, description, or other field data.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
      productId: z.string().describe('The product ID to update'),
      fieldData: z.record(z.unknown()).describe('Updated product field data'),
    }),
    execute: async ({
      siteId,
      productId,
      fieldData,
    }: {
      siteId: string;
      productId: string;
      fieldData: Record<string, unknown>;
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await client.products.update(siteId, productId, { fieldData } as any);
      return { updated: true, productId };
    },
  };
}

export function createProductTools(client: WebflowClient) {
  return {
    listProducts: createListProductsTool(client),
    getProduct: createGetProductTool(client),
    createProduct: createCreateProductTool(client),
    updateProduct: createUpdateProductTool(client),
  };
}
