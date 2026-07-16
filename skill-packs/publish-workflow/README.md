# Publish Workflow Skill Pack

Human-in-the-loop publish workflow for Webflow CMS content.

## What It Does

1. Finds all staged/draft items in a collection
2. Generates a review summary (titles, slugs, status)
3. Presents the review to a human for approval
4. Publishes only approved items upon confirmation
5. Creates a publish report

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

export async function reviewAndPublish(collectionId: string, approvedItemIds?: string[]) {
  const kit = createWebflowAgentKit({ type: 'env' });
  const tools = toVercelAITools(kit, ['cms']);

  // Step 1: List all staged items
  const { text: review } = await generateText({
    model: anthropic('claude-sonnet-4-5'),
    tools,
    maxSteps: 5,
    prompt: `List all staged items in collection ${collectionId}. For each item, show the title and creation date.`,
  });

  // Step 2: Publish approved items
  if (approvedItemIds && approvedItemIds.length > 0) {
    await generateText({
      model: anthropic('claude-sonnet-4-5'),
      tools,
      maxSteps: 5,
      prompt: `Publish these items from collection ${collectionId}: ${approvedItemIds.join(', ')}`,
    });
    return { published: approvedItemIds.length };
  }

  return { review };
}
```

## Skill Configuration

```yaml
name: publish-workflow
version: 0.1.0
description: Staged → review → publish with human-in-the-loop approval
tool_groups: [cms]
max_steps: 10
```
