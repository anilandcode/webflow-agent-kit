# content-migration — EXPERIMENTAL

> **Status:** Experimental. Not production-ready.
> Safe implementation with dry-run, mutation plans, and audit records is pending.
> Use the TypeScript packages directly for CMS operations:
> ```bash
> npm install @webflow-agent-kit/core @webflow-agent-kit/vercel-ai
> ```

## What It Will Do

1. Reads source CMS items (from a source collection or external JSON/CSV)
2. Maps source fields to target collection fields
3. Creates items in the target collection in batch
4. Validates the migration with a diff report
5. Publishes migrated items (optional)

## When Available

This skill will be implemented with the `@webflow-agent-kit/skills` framework: full manifest, dry-run default, confirmation gating, and audit records.

See [seo-audit](../seo-audit/) for an example of a fully implemented skill.
