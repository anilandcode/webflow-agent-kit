import { z } from 'zod';
import type { WebflowClient } from 'webflow-api';

export function createListWebhooksTool(client: WebflowClient) {
  return {
    name: 'webflow_list_webhooks',
    description:
      'List all webhooks registered for a site. Webhooks notify your server when events happen (form submissions, site publishes, etc.).',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
    }),
    execute: async ({ siteId }: { siteId: string }) => {
      const webhooks = await client.webhooks.list(siteId);
      return { webhooks };
    },
  };
}

export function createCreateWebhookTool(client: WebflowClient) {
  return {
    name: 'webflow_create_webhook',
    description:
      'Create a new webhook for a site. Specify a triggerType (e.g., form_submission, site_publish, ecomm_new_order, collection_item_created) and a URL to receive POST notifications. Max 75 webhooks per trigger type.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
      triggerType: z
        .enum([
          'form_submission',
          'site_publish',
          'ecomm_new_order',
          'ecomm_order_changed',
          'ecomm_inventory_changed',
          'collection_item_created',
          'collection_item_changed',
          'collection_item_deleted',
        ])
        .describe('The event type that triggers the webhook'),
      url: z.string().url().describe('The URL to POST webhook payloads to'),
    }),
    execute: async ({
      siteId,
      triggerType,
      url,
    }: {
      siteId: string;
      triggerType: string;
      url: string;
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const webhook = await client.webhooks.create(siteId, { triggerType, url } as any);
      return { webhook };
    },
  };
}

export function createGetWebhookTool(client: WebflowClient) {
  return {
    name: 'webflow_get_webhook',
    description: 'Get details of a specific webhook by its ID.',
    inputSchema: z.object({
      webhookId: z.string().describe('The webhook ID'),
    }),
    execute: async ({ webhookId }: { webhookId: string }) => {
      const webhook = await client.webhooks.get(webhookId);
      return { webhook };
    },
  };
}

export function createDeleteWebhookTool(client: WebflowClient) {
  return {
    name: 'webflow_delete_webhook',
    description: 'Delete a webhook. The webhook will stop sending notifications.',
    inputSchema: z.object({
      webhookId: z.string().describe('The webhook ID to delete'),
    }),
    execute: async ({ webhookId }: { webhookId: string }) => {
      await client.webhooks.delete(webhookId);
      return { deleted: true, webhookId };
    },
  };
}

export function createWebhookTools(client: WebflowClient) {
  return {
    listWebhooks: createListWebhooksTool(client),
    createWebhook: createCreateWebhookTool(client),
    getWebhook: createGetWebhookTool(client),
    deleteWebhook: createDeleteWebhookTool(client),
  };
}
