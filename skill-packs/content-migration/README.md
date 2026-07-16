# Content Migration Skill Pack

Agent recipe for migrating CMS content between collections, sites, or external sources.

## What It Does

1. Reads source CMS items (from a source collection or external JSON/CSV)
2. Maps source fields to target collection fields
3. Creates items in the target collection in batch
4. Validates the migration with a diff report
5. Publishes migrated items (optional)

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

export async function migrateContent(
  sourceCollectionId: string,
  targetCollectionId: string,
  fieldMapping: Record<string, string>,
) {
  const kit = createWebflowAgentKit({ type: 'env' });
  const tools = toVercelAITools(kit, ['cms', 'collections']);

  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-5'),
    tools,
    maxSteps: 30,
    system: `You are a content migration specialist. Follow this field mapping: ${JSON.stringify(fieldMapping)}. For each source item, create a corresponding target item with mapped fields. Report progress after each batch.`,
    prompt: `Migrate all items from collection ${sourceCollectionId} to ${targetCollectionId} using the provided field mapping. Read all source items first, then create them in the target collection.`,
  });

  return text;
}
```

## Skill Configuration

```yaml
name: content-migration
version: 0.1.0
description: Migrate CMS items from/to external sources or between collections
tool_groups: [cms, collections]
max_steps: 30
```
