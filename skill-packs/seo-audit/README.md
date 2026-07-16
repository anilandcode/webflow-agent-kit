# SEO Audit Skill Pack

Multi-step agent recipe for auditing Webflow site SEO and fixing issues in bulk.

## What It Does

1. Lists all pages on a site
2. Reads each page's SEO metadata (title, description, Open Graph)
3. Uses an LLM to generate optimized SEO metadata for every page
4. Bulk-updates all page metadata in a single pass
5. Optionally updates robots.txt for improved crawling

## Dependencies

```bash
npm install @webflow-agent-kit/core @webflow-agent-kit/vercel-ai ai @ai-sdk/anthropic
```

## Usage (Vercel AI SDK)

```typescript
import { createWebflowAgentKit } from '@webflow-agent-kit/core';
import { toVercelAITools } from '@webflow-agent-kit/vercel-ai';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export async function seoAudit(siteId: string) {
  const kit = createWebflowAgentKit({ type: 'env' });
  const tools = toVercelAITools(kit, ['pages', 'seo', 'sites']);

  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-5'),
    tools,
    maxSteps: 20,
    system:
      'You are an SEO auditor. Audit every page on the site. For each page, generate optimized SEO titles (50-60 chars) and meta descriptions (150-160 chars) with target keywords. Update all pages, then update robots.txt if needed.',
    prompt: `Audit site ${siteId} for SEO. List all pages, check their current SEO metadata, generate improved versions, and apply the updates.`,
  });

  return text;
}
```

## Skill Configuration

```yaml
name: seo-audit
version: 0.1.0
description: Audit all pages, update meta, and optimize robots.txt
tool_groups: [pages, seo, sites]
max_steps: 20
system_prompt: |
  You are an SEO auditor. For each page:
  1. Read current SEO metadata
  2. Generate optimized title (50-60 chars including primary keyword)
  3. Generate optimized meta description (150-160 chars)
  4. Set appropriate Open Graph tags
  5. Apply all updates via updatePageMetadata
  6. Review robots.txt for crawling optimization
```
