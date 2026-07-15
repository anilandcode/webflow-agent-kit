import { z } from 'zod';
import type { WebflowClient } from 'webflow-api';

export function createGetInventoryTool(client: WebflowClient) {
  return {
    name: 'webflow_get_inventory',
    description:
      'Get current inventory levels for a specific SKU. Returns quantity and inventory type (finite or infinite).',
    inputSchema: z.object({
      skuCollectionId: z.string().describe('The SKU collection ID (use listCollections to find)'),
      skuId: z.string().describe('The SKU ID'),
    }),
    execute: async ({
      skuCollectionId,
      skuId,
    }: {
      skuCollectionId: string;
      skuId: string;
    }) => {
      const inventory = await client.inventory.list(skuCollectionId, skuId);
      return { inventory };
    },
  };
}

export function createUpdateInventoryTool(client: WebflowClient) {
  return {
    name: 'webflow_update_inventory',
    description:
      'Update inventory for a SKU. Set quantity directly, adjust incrementally with updateQuantity, or set inventoryType to infinite. Useful for stock management.',
    inputSchema: z.object({
      skuCollectionId: z.string().describe('The SKU collection ID'),
      skuId: z.string().describe('The SKU ID'),
      inventoryType: z.enum(['finite', 'infinite']).optional().describe('Set to infinite for unlimited stock'),
      quantity: z.number().min(0).optional().describe('Absolute quantity to set'),
      updateQuantity: z.number().optional().describe('Incremental adjustment (+add stock, -remove stock)'),
    }),
    execute: async ({
      skuCollectionId,
      skuId,
      inventoryType,
      quantity,
      updateQuantity,
    }: {
      skuCollectionId: string;
      skuId: string;
      inventoryType?: string;
      quantity?: number;
      updateQuantity?: number;
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const request: any = {};
      if (inventoryType) request.inventoryType = inventoryType;
      if (quantity !== undefined) request.quantity = quantity;
      if (updateQuantity !== undefined) request.updateQuantity = updateQuantity;
      const inventory = await client.inventory.update(skuCollectionId, skuId, request);
      return { inventory };
    },
  };
}

export function createGetEcommerceSettingsTool(client: WebflowClient) {
  return {
    name: 'webflow_get_ecommerce_settings',
    description:
      'Get ecommerce settings for a site, including default currency, payment methods, and store configuration.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
    }),
    execute: async ({ siteId }: { siteId: string }) => {
      const settings = await client.ecommerce.getSettings(siteId);
      return { settings };
    },
  };
}

export function createInventoryTools(client: WebflowClient) {
  return {
    getInventory: createGetInventoryTool(client),
    updateInventory: createUpdateInventoryTool(client),
    getEcommerceSettings: createGetEcommerceSettingsTool(client),
  };
}
