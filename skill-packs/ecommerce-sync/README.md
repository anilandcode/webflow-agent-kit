# Ecommerce Sync Skill Pack

Agent recipe for syncing ecommerce inventory and product data between Webflow and external systems.

## What It Does

1. Reads current inventory levels for all products/SKUs
2. Accepts inventory updates from external sources (Shopify, CSV, API)
3. Applies batch inventory updates (absolute or incremental)
4. Optionally creates new products or updates existing ones
5. Generates a sync report with diffs

## Dependencies

```bash
npm install @webflow-agent-kit/core @webflow-agent-kit/vercel-ai ai @ai-sdk/anthropic
```

## Usage

```typescript
import { createWebflowAgentKit } from '@webflow-agent-kit/core';
import { toVercelAITools } from '@webflow-agent-kit/vercel-ai';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export async function syncInventory(
  siteId: string,
  inventoryUpdates: Array<{ skuCollectionId: string; skuId: string; quantity: number }>,
) {
  const kit = createWebflowAgentKit({ type: 'env' });
  const tools = toVercelAITools(kit, ['inventory', 'products', 'orders']);

  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-5'),
    tools,
    maxSteps: 30,
    system: `You are an ecommerce inventory manager. Update inventory levels for the following SKUs. Process each update sequentially and confirm the result. Inventory updates: ${JSON.stringify(inventoryUpdates)}`,
    prompt: `For site ${siteId}, update all SKU inventory levels using the provided data. Use the updateInventory tool with absolute quantity values. Confirm each update.`,
  });

  return text;
}
```

## Skill Configuration

```yaml
name: ecommerce-sync
version: 0.1.0
description: Sync inventory and products between Webflow and external systems
tool_groups: [inventory, products, orders]
max_steps: 30
```
