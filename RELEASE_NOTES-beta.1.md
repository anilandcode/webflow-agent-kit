## v0.1.0-beta.1

**First beta release.** This is a prerelease — APIs may change before v1.0.0. Not recommended for production without thorough testing against a staging site.

### Beta Candidates

| Package | Status | Tests |
|---|---|---|
| `@webflow-agent-kit/core` (v0.0.2 → v0.1.0-beta.1) | **Beta** | 71 tests |
| `@webflow-agent-kit/vercel-ai` (v0.0.1 → v0.1.0-beta.1) | **Beta** | Package smoke verified |
| `@webflow-agent-kit/mcp` (v0.0.1 → v0.1.0-beta.1) | **Beta** | MCP protocol smoke verified (62 tools) |
| `@webflow-agent-kit/skills` (v0.0.1 → v0.1.0-beta.1) | **Beta** | 29 tests (first npm publish) |

### Not Included in Beta

| Package | Reason |
|---|---|
| `@webflow-agent-kit/google-adk` | Experimental — no Google ADK SDK dependency validated |
| `@webflow-agent-kit/cli` | `run` command is a prototype; not fully tested |
| `@webflow-agent-kit/langchain` | No integration tests; optional peer deps unverified in isolation |
| `webflow-agent-kit-python` | Pre-alpha scaffold — all adapters return NotImplementedError |

### Requirements

- **Node.js** 18.0.0 or later (tested on 20 and 22)
- **pnpm** 9.x (for development; npm/pnpm/yarn for installation)
- A **Webflow site token** with scopes matching your tool usage
- A **staging Webflow site** — not production — for initial testing

### Safety

- **Mutation policy is enforced.** The default mode is `read_only`. Write operations require explicit opt-in via `{ mode: 'allow_writes' }`.
- **MCP server respects the policy.** Blocked tools return structured error responses.
- **Audit hooks** fire on every tool call decision. Set `setAuditHook()` for observability.
- **Secrets are redacted** (`token`, `password`, `key`, `auth` fields → `***REDACTED***`).

See [docs/safety-and-mutations.md](https://github.com/anilandcode/webflow-agent-kit/blob/main/docs/safety-and-mutations.md).

### Known Limitations

1. **MCP parameter schemas are simplified.** Tools execute correctly but parameter type hints may not appear in MCP clients. A fix is tracked.
2. **No real LLM agent integration test.** Package smoke verifies that packages install and import. The Next.js demo has dependency version conflicts between `ai` and `@ai-sdk/google`.
3. **Tool descriptions may need refinement for LLM routing.** Some tools have overlapping descriptions (e.g., staged vs live CMS). Use group filtering to narrow scope.
4. **Rollback is not fully implemented.** The `publish-workflow` skill has a rollback stub. Other write operations cannot be automatically reversed.
5. **No npm provenance.** Published without `--provenance` flag. A SLSA compliance update is tracked.

### Webflow Staging Site

Always test mutation tools against a **non-production Webflow site** first. Use a [Developer Workspace](https://developers.webflow.com/) sandbox site. The mutation policy defaults to `read_only`, but explicit `allow_writes` mode will create, update, and delete real data.

### Beta Expectations

- **APIs are not frozen.** Tool names, function signatures, and policy interfaces may change.
- **New tools may be added** in minor beta releases.
- **Breaking changes** will be documented in the changelog and versioned per semver.
- **Beta users report issues at:** [github.com/anilandcode/webflow-agent-kit/issues](https://github.com/anilandcode/webflow-agent-kit/issues)

### Installation

```bash
npm install @webflow-agent-kit/core@beta @webflow-agent-kit/vercel-ai@beta @webflow-agent-kit/mcp@beta @webflow-agent-kit/skills@beta
```

### Quick Start

```typescript
import { createWebflowAgentKit } from '@webflow-agent-kit/core';
import { toVercelAITools } from '@webflow-agent-kit/vercel-ai';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

const kit = createWebflowAgentKit({ type: 'env' });
const tools = toVercelAITools(kit);

const { text } = await generateText({
  model: anthropic('claude-sonnet-4-5'),
  tools,
  maxSteps: 10,
  prompt: 'List all my Webflow sites and their published status.',
});
```

### Verification

All checks passed on 2026-07-17:

```
✅ pnpm install --frozen-lockfile
✅ pnpm lint (0 errors, 4 warnings)
✅ pnpm typecheck (8/8 packages)
✅ pnpm test (89/89 tests)
✅ pnpm build
✅ node scripts/package-smoke.mjs (7/7 packages)
✅ node packages/mcp/scripts/smoke-test.mjs (62 tools)
```
