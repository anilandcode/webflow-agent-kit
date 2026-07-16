# ecommerce-sync — EXPERIMENTAL

> **Status:** Experimental. Not production-ready.
> Safe implementation with dry-run, mutation plans, and audit records is pending.
> Use the TypeScript packages directly for ecommerce operations:
> ```bash
> npm install @webflow-agent-kit/core @webflow-agent-kit/vercel-ai
> ```

## What It Will Do

1. Reads current inventory levels for all products/SKUs
2. Accepts inventory updates from external sources (Shopify, CSV, API)
3. Applies batch inventory updates (absolute or incremental)
4. Optionally creates new products or updates existing ones
5. Generates a sync report with diffs

## When Available

This skill will be implemented with the `@webflow-agent-kit/skills` framework: full manifest, dry-run default, confirmation gating, and audit records.

See [seo-audit](../seo-audit/) for an example of a fully implemented skill.
