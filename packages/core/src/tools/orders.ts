import { z } from 'zod';
import type { WebflowClient } from 'webflow-api';

export function createListOrdersTool(client: WebflowClient) {
  return {
    name: 'webflow_list_orders',
    description:
      'List all ecommerce orders for a site. Filter by status (pending, unfulfilled, fulfilled, disputed).',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
      status: z
        .enum(['pending', 'unfulfilled', 'fulfilled', 'disputed', 'all'])
        .optional()
        .default('all')
        .describe('Filter by order status'),
      limit: z.number().min(1).max(100).optional().default(50),
      offset: z.number().min(0).optional().default(0),
    }),
    execute: async ({
      siteId,
      status,
      limit,
      offset,
    }: {
      siteId: string;
      status: string;
      limit: number;
      offset: number;
    }) => {
      const request: Record<string, unknown> = { limit, offset };
      if (status !== 'all') request.status = status;
      const response = await client.orders.list(siteId, request);
      return response;
    },
  };
}

export function createGetOrderTool(client: WebflowClient) {
  return {
    name: 'webflow_get_order',
    description:
      'Get full details of a single order, including customer info, line items, shipping, and totals.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
      orderId: z.string().describe('The order ID'),
    }),
    execute: async ({ siteId, orderId }: { siteId: string; orderId: string }) => {
      const order = await client.orders.get(siteId, orderId);
      return { order };
    },
  };
}

export function createUpdateOrderTool(client: WebflowClient) {
  return {
    name: 'webflow_update_order',
    description:
      'Update order fields like comment, shippingProvider, or shippingTracking. All three can be updated simultaneously or independently.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
      orderId: z.string().describe('The order ID'),
      comment: z.string().optional().describe('Internal order comment'),
      shippingProvider: z.string().optional().describe('Shipping provider name'),
      shippingTrackingNumber: z.string().optional().describe('Shipping tracking number'),
    }),
    execute: async ({
      siteId,
      orderId,
      comment,
      shippingProvider,
      shippingTrackingNumber,
    }: {
      siteId: string;
      orderId: string;
      comment?: string;
      shippingProvider?: string;
      shippingTrackingNumber?: string;
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const request: any = {};
      if (comment) request.comment = comment;
      if (shippingProvider) request.shippingProvider = shippingProvider;
      if (shippingTrackingNumber) request.shippingTracking = shippingTrackingNumber;
      const order = await client.orders.update(siteId, orderId, request);
      return { order };
    },
  };
}

export function createFulfillOrderTool(client: WebflowClient) {
  return {
    name: 'webflow_fulfill_order',
    description:
      'Fulfill an order — updates its status to fulfilled. Optionally send a notification email to the customer.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
      orderId: z.string().describe('The order ID to fulfill'),
      sendOrderFulfilledEmail: z
        .boolean()
        .optional()
        .default(true)
        .describe('Send order fulfilled email to customer'),
    }),
    execute: async ({
      siteId,
      orderId,
      sendOrderFulfilledEmail,
    }: {
      siteId: string;
      orderId: string;
      sendOrderFulfilledEmail: boolean;
    }) => {
      await client.orders.updateFulfill(siteId, orderId, { sendOrderFulfilledEmail });
      return { fulfilled: true, orderId };
    },
  };
}

export function createUnfulfillOrderTool(client: WebflowClient) {
  return {
    name: 'webflow_unfulfill_order',
    description: 'Unfulfill an order — updates its status back from fulfilled to unfulfilled.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
      orderId: z.string().describe('The order ID to unfulfill'),
    }),
    execute: async ({ siteId, orderId }: { siteId: string; orderId: string }) => {
      await client.orders.updateUnfulfill(siteId, orderId);
      return { unfulfilled: true, orderId };
    },
  };
}

export function createOrderTools(client: WebflowClient) {
  return {
    listOrders: createListOrdersTool(client),
    getOrder: createGetOrderTool(client),
    updateOrder: createUpdateOrderTool(client),
    fulfillOrder: createFulfillOrderTool(client),
    unfulfillOrder: createUnfulfillOrderTool(client),
  };
}
