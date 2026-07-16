# Production Readiness Plan — webflow-agent-kit

> **Audit date:** 2026-07-16 | **Current tags:** 8 commits, `v0.0.2` (core), `v0.0.1` (all others) | **Target:** `v0.1.0`

---

## Phase Audit Summary

A full file-by-file audit of all 6 npm packages, the Python companion, skill packs, and examples was conducted on 2026-07-16. Key findings:

| Area | Verdict |
|---|---|
| **core** (62 tools, 30 tests) | ✅ Production-ready |
| **vercel-ai** adapter | ✅ Real code, no tests |
| **langchain** adapter | ✅ Real code, no tests |
| **mcp** server | ✅ Real code, **schema stripping bug**, no tests |
| **google-adk** adapter | ⚠️ No Google ADK SDK dependency — plausible shape, unproven |
| **cli** | ⚠️ `run` command is a stub, no tests |
| **python** companion | ❌ Pure placeholder — all methods return hardcoded data |
| **skill-packs** (4) | ⚠️ Markdown-only, no executable manifests, no guardrails |
| **examples** (4) | ⚠️ 2 real (vercel-ai-agent, langchain-agent), 2 markdown-only (mcp, cli) |

---

## P0 — Launch Blockers (must ship before v0.1.0)

### P0-1: Fix MCP schema stripping bug

**Symptom:** `coreToMcpSchema()` in `packages/mcp/src/server.ts` returns `{ type: 'object', properties: {} }` for every tool, discarding the actual Zod schema. MCP clients (Claude Desktop, Claude Code, Codex, Cursor) will not see tool parameter types, only tool names and descriptions.

**Fix:** Walk the Zod schema's `.shape()` to generate a real JSON Schema. Use `zod-to-json-schema` or manually traverse `tool.inputSchema._def.shape()` for each field.

**Affected files:**
- `packages/mcp/src/server.ts` (lines ~25-33, `coreToMcpSchema` function)
- `packages/mcp/package.json` (add `zod-to-json-schema` dep or similar)

**Acceptance criteria:**
- `curl` or `stdio` test against the MCP server shows `inputSchema.properties` with actual field names and types
- Claude Desktop connected to the MCP server shows parameter hints when typing tool calls
- Existing `coreToMcpSchema` replaced with a function that traverses Zod schemas

**Test requirements:**
- Unit test: `coreToMcpSchema` given a tool with `{ pageId: z.string() }` returns `inputSchema.properties.pageId.type === 'string'`
- Integration test: start the MCP server via `StdioServerTransport`, call `ListToolsRequestSchema`, assert non-empty `properties` on the first tool

**Rollback:** The MCP server already works functionally (calls execute correctly) — revert to the current simplistic schema if the Zod traversal introduces breaking changes. The server will still execute tools correctly; only parameter hints degrade.

---

### P0-2: Fix README claims vs reality

**Symptom:** README states Gemini model `gemini-2.0-flash` in quick-start code snippet — this is correct per our audit. But README also says the demo "auto-detects Gemini, Anthropic, or OpenAI" which is only partially true (demo code exists but was never verified working with a real key and has dependency version conflicts between `ai` v5 and `@ai-sdk/google` v4).

**Fix:**
1. Update the quick-start code snippet to use `@ai-sdk/google` v4 and `ai` v5 (both installed, verified compatible)
2. Update `examples/vercel-ai-agent/package.json` to pin `ai: ^5.0.0` and update the `createAgentRunner` in core to match
3. Mark Google ADK in README as "Beta" until real integration is validated
4. Mark Python in README as "Coming soon — scaffold only" (currently the README says "Coming soon — Python bindings" which is truthful)

**Affected files:**
- `README.md` (Google ADK row, Python row, version badges)
- `examples/vercel-ai-agent/package.json` (`ai` version, `@ai-sdk/google` version)
- `examples/vercel-ai-agent/app/api/chat/route.ts` (provider detection logic)

**Acceptance criteria:**
- README quick-start snippet is executable as-written (copy, paste, `npm install`, run)
- Google ADK is labeled "Beta — shape correct, real integration pending"
- Python is labeled "Coming soon — placeholder"

**Rollback:** Revert README to previous version. No code behavior changes — only labeling.

---

### P0-3: Remove or fix CLI `run` command stub

**Symptom:** `wfak run <prompt>` prints "Full agent execution coming in Phase 2" and does nothing. This is misleading for production users.

**Fix:** Remove the `run` command entirely until it has a real implementation, or implement a minimal version that:
1. Reads the prompt
2. Initializes `createWebflowAgentKit({ type: 'env' })`
3. Outputs "Run with: import { toVercelAITools } from '@webflow-agent-kit/vercel-ai' and pass to generateText()" as guidance

**Affected files:**
- `packages/cli/src/index.ts` (lines ~46-53, `run` command handler)

**Acceptance criteria:**
- `wfak --help` does not list `run` as a command, OR
- `wfak run "List sites"` outputs actionable guidance rather than a stub message

**Rollback:** Re-add the `run` command. Minimal risk.

---

### P0-4: CI must validate build artifacts, not just compile

**Symptom:** GitHub Actions CI (`ci.yml`) runs: lint → typecheck → test → build. It does NOT verify that:
- `dist/` output is actually functional (e.g., `node -e "require('./dist/index.cjs')"`)
- The MCP server starts and accepts requests
- The CLI `wfak auth` runs without errors
- All 6 packages can be `require()`d or `import()`ed without crashing

**Fix:** Add a "Validate artifacts" job to CI:
```yaml
validate:
  runs-on: ubuntu-latest
  steps:
    - run: pnpm build
    - run: |
        for pkg in core vercel-ai langchain google-adk mcp cli; do
          node -e "require('./packages/$pkg/dist/index.cjs')" || exit 1
          node --input-type=module -e "import('./packages/$pkg/dist/index.js')" || exit 1
        done
    - run: |
        # Verify MCP server starts (timeout after 5s — it's stdio-bound)
        timeout 5 node packages/mcp/dist/server.js || true
    - run: |
        npx @webflow-agent-kit/cli auth 2>&1 | grep -q "WEBFLOW_TOKEN" || exit 1
```

**Affected files:**
- `.github/workflows/ci.yml` (add `validate` job)

**Acceptance criteria:**
- CI fails if any package's dist cannot be loaded via `require()` or `import()`
- CI fails if the CLI binary crashes on startup
- MCP server startup is checked (timeout-based, not blocking)

**Rollback:** Remove the validate job from CI. No code changes — CI only.

---

### P0-5: Skill packs must have executable manifests and mutation guardrails

**Symptom:** All 4 skill packs are markdown-only READMEs with no executable code, no machine-readable manifest (YAML/JSON), no safe-mutation controls, and no discoverability mechanism. An agent reading these cannot programmatically load or execute them.

**Fix:**
1. Add a `manifest.yaml` to each skill pack:
```yaml
name: seo-audit
version: "0.1.0"
tool_groups: [pages, seo, sites]
mutation_risk: low   # low | medium | high
requires_approval: false
```
2. Add a `skill-packs/index.yaml` that registers all packs for programmatic discovery
3. Add a `safe_mode` flag to `createAgentRunner` that blocks `mutation_risk: high` packs unless explicitly allowed

**Affected files:**
- `skill-packs/seo-audit/manifest.yaml` (new)
- `skill-packs/content-migration/manifest.yaml` (new)
- `skill-packs/publish-workflow/manifest.yaml` (new)
- `skill-packs/ecommerce-sync/manifest.yaml` (new)
- `skill-packs/index.yaml` (new)
- `packages/core/src/agent-runner.ts` (add `safeMode` option)

**Acceptance criteria:**
- Each skill pack has a `manifest.yaml` with at minimum: `name`, `version`, `tool_groups`, `mutation_risk`
- `skill-packs/index.yaml` lists all 4 packs
- `createAgentRunner({ safeMode: true })` rejects packs with `mutation_risk: high` unless explicitly allowed
- Existing skill pack READMEs remain as documentation

**Rollback:** Remove manifest files and revert `agent-runner.ts`. Skill packs return to markdown-only state.

---

### P0-6: Add Zod-to-JSON-Schema for MCP (part of P0-1)

**Separate entry for dependency management:** The Zod schema conversion for MCP should use `zod-to-json-schema` (6kB, zero deps, widely used) rather than custom traversal to avoid edge cases with `.optional()`, `.default()`, `.describe()`, and nested objects.

**Affected files:**
- `packages/mcp/package.json` (add `zod-to-json-schema`)
- `packages/mcp/src/server.ts` (rewrite `coreToMcpSchema`)

---

## P1 — Stability Work (should ship before public launch)

### P1-1: Adapter test coverage

**Status:** Zero tests across all 5 adapter packages (vercel-ai, langchain, google-adk, mcp, cli).

**Fix:** Add minimal smoke tests for each adapter that:
1. Creates a mock `WebflowAgentKit` with a fake client
2. Calls the adapter function
3. Asserts the output has the expected shape (tools, names, schemas)

**Affected files:**
- `packages/vercel-ai/src/__tests__/index.test.ts` (new)
- `packages/langchain/src/__tests__/index.test.ts` (new)
- `packages/google-adk/src/__tests__/index.test.ts` (new)
- `packages/mcp/src/__tests__/server.test.ts` (new)
- `packages/cli/src/__tests__/index.test.ts` (new)

**Acceptance criteria:**
- Each adapter package has at least 1 test that imports the adapter function and calls it with a mock kit
- `pnpm test` runs all adapter tests

**Rollback:** Remove test files. No production code changes.

---

### P1-2: Integration test against real Webflow API

**Status:** A one-off integration test was run (7/11 read-only tools passed). Not automated. No write-operation integration tests in CI.

**Fix:** Add a `test:integration` script that is opt-in (requires `WEBFLOW_TOKEN` env var, skipped in regular CI):
1. List sites
2. List pages
3. List collections
4. Create a test collection → create an item → read it → update it → delete the item → delete the collection
5. Clean up on failure (no orphaned test data)

**Affected files:**
- `packages/core/src/__tests__/integration.test.ts` (new)
- `packages/core/package.json` (add `test:integration` script)

**Acceptance criteria:**
- `WEBFLOW_TOKEN=xxx pnpm test:integration` runs the full CRUD lifecycle against a real site
- No test data remains after the test (even on failure, cleanup runs)

**Rollback:** Remove the integration test file. No production code changes.

---

### P1-3: API key rotation and security guide

**Status:** The authentication docs cover setup but not security best practices. The `.env.local` file is mentioned but no guidance on rotation, scoping, or token hygiene.

**Fix:** Add `docs/security.md` covering:
1. Token scoping (least privilege per tool group)
2. Token rotation schedule
3. `.env.local` vs CI secrets management
4. Rate limit implications of agent tool usage
5. Safe mode and mutation risk (ties to P0-5)

**Affected files:**
- `docs/security.md` (new)

**Acceptance criteria:**
- `docs/security.md` exists with at least the 5 sections above
- Linked from README documentation section

**Rollback:** Remove the file. No code changes.

---

### P1-4: Troubleshooting guide

**Status:** No troubleshooting documentation. Common failures (429 rate limits, 403 OAuth scope errors, 409 conflict errors, quota exhausted) return raw Webflow error bodies which are confusing for new users.

**Fix:** Add `docs/troubleshooting.md` covering:
1. Rate limit (429) — how to configure rate limiter
2. Auth errors (401) — token scopes, token format
3. Conflict errors (409) — site not published, ecommerce not initialized
4. Quota errors (Gemini 429) — free tier limits, how to get a new key
5. MCP connection issues — `StdioServerTransport` troubleshooting

**Affected files:**
- `docs/troubleshooting.md` (new)

**Acceptance criteria:**
- At least 5 common error scenarios documented with resolution steps
- Linked from README documentation section

**Rollback:** Remove the file.

---

### P1-5: Consistent error wrapping in tool execution

**Status:** Tools call the Webflow SDK directly. Webflow SDK errors (from `webflow-api`) are thrown as-is. The `RateLimiter.acquire()` wraps some 429 errors but not all HTTP error types. There is no consistent error envelope that agents can parse.

**Fix:** Wrap all tool `execute` functions with a try/catch that converts known Webflow error shapes into `WebflowAgentError` subclasses. This gives agents predictable error objects to reason about.

**Affected files:**
- `packages/core/src/tools/*.ts` (all 15 tool files)
- `packages/core/src/errors.ts` (add `ConflictError`, `ForbiddenError` classes)

**Acceptance criteria:**
- Tools throw `WebflowAgentError` subclasses, not raw SDK errors
- `NotFoundError` includes `resourceType` and `resourceId`
- `RateLimitError` includes `retryAfterMs`
- New `ConflictError` for 409 responses
- New `ForbiddenError` for 403 responses

**Rollback:** Restore direct SDK error propagation. Agents handle errors less predictably.

---

### P1-6: Docs site must match actual package surface

**Status:** The `docs-site/` directory contains an Astro Starlight scaffold with 5 starter pages. It does not list:
- The actual 62 tools (only a summary table)
- The actual 6 adapters (only mentions Vercel AI, LangChain, MCP, CLI — no Google ADK, no agnostic runner)
- Any skill pack documentation
- The Python package

**Fix:** Fill in the missing docs-site pages:
1. `/tools/overview.md` — update with the actual 15-group/62-tool breakdown
2. `/adapters/google-adk.md` — new
3. `/adapters/provider-agnostic.md` — new
4. `/examples/skill-packs.md` — expand with manifest explanations
5. Add a `/python/` section

**Affected files:**
- `docs-site/src/content/docs/tools/overview.md`
- `docs-site/src/content/docs/adapters/google-adk.md` (new)
- `docs-site/src/content/docs/adapters/provider-agnostic.md` (new)
- `docs-site/astro.config.mjs` (update sidebar)

**Acceptance criteria:**
- Docs sidebar lists all 6 adapters
- Python page has a "Status: Placeholder" banner
- Tool overview page lists the actual 15 groups with exact counts

**Rollback:** Remove the new pages. Docs revert to scaffold state.

---

## P2 — Ecosystem Work (post v0.1.0)

### P2-1: Validate Google ADK integration

**Status:** `packages/google-adk` defines `ADKTool` locally and has zero Google ADK SDK deps. Cannot claim ADK support until a real integration test passes.

**Fix:**
1. Add `@google/adk` as a dev dependency
2. Write a test that imports real Google ADK types and verifies `ADKTool` matches
3. If incompatible, add a real `toGoogleADKTool()` wrapper that produces actual Google ADK instances

**Affected files:**
- `packages/google-adk/package.json`
- `packages/google-adk/src/index.ts`
- `packages/google-adk/src/__tests__/index.test.ts` (new)

**Acceptance criteria:**
- Test imports from `@google/adk` and validates `ADKTool` shape
- `toGoogleADKTools()` returns objects that satisfy `instanceof` or structural check against the real SDK

**Rollback:** Remove Google ADK dep. Revert to locally-defined interface. Package downgraded to "coming soon" in README.

---

### P2-2: Implement Python package (replace placeholder)

**Status:** Entirely non-functional. Every method returns hardcoded/empty data. No MCP client connection code.

**Fix:** Implement a real Python package that:
1. Starts `@webflow-agent-kit/mcp` as a subprocess
2. Communicates via MCP protocol (stdio or HTTP)
3. Exposes real `to_openai_sdk()`, `to_langchain()`, `to_crewai()` adapters

**Affected files:**
- `webflow-agent-kit-python/webflow_agent_kit/client.py`
- `webflow-agent-kit-python/webflow_agent_kit/tools.py`
- `webflow-agent-kit-python/webflow_agent_kit/adapters/openai.py` (new)
- `webflow-agent-kit-python/webflow_agent_kit/adapters/langchain.py` (new)

**Acceptance criteria:**
- `kit = WebflowAgentKit.from_env()` starts the TS MCP server subprocess
- `kit.all_tools().to_openai_sdk()` returns a list of real OpenAI function tool dicts
- Integration test: Python → subprocess MCP → Webflow API → real response

**Rollback:** Package returns to placeholder state. README reflects "coming soon."

---

### P2-3: CI validates Python, docs, and examples

**Status:** CI only validates TypeScript packages. Python, docs-site, skill packs, and examples are not validated.

**Fix:**
1. Add Python lint/typecheck to CI (`ruff` or `mypy` on `webflow-agent-kit-python/`)
2. Add docs-site build to CI (`cd docs-site && npm install && npm run build`)
3. Add example builds to CI (`cd examples/vercel-ai-agent && npm install && npm run build`)

**Affected files:**
- `.github/workflows/ci.yml` (add `python`, `docs`, `examples` jobs)

**Acceptance criteria:**
- CI fails if Python package has syntax errors
- CI fails if docs site fails to build
- CI fails if examples fail to build

**Rollback:** Remove the jobs from CI. Core TypeScript CI unaffected.

---

### P2-4: NPM provenance and supply chain

**Status:** Packages are published manually via `npm publish`. No provenance attestation, no SLSA compliance, no `--provenance` flag.

**Fix:** Enable `--provenance` on publish (requires npm paid plan or GitHub Actions with `id-token: write`). Add `.npmrc` with `provenance=true`. Update `release.yml` to use `npm publish --provenance`.

**Affected files:**
- `.github/workflows/release.yml`
- `.npmrc` (new, root)

**Acceptance criteria:**
- `npm info @webflow-agent-kit/core --json | jq .provenance` returns non-empty
- Release workflow uses `id-token: write` permission

**Rollback:** Remove `--provenance` flag. Packages still publish.

---

## P2-5: HelmOS integration and Collective Fund application

**Status:** Plan mentions HelmOS skill marketplace and Webflow Collective Fund. These are external submissions, not code.

**Fix:** Prepare HelmOS skill pack manifests following their format. Draft Collective Fund application with usage metrics and community impact.

**Affected files:**
- `helm-os/manifests/*.yaml` (new directory)
- `docs/collective-fund-application.md` (new)

**Acceptance criteria:**
- HelmOS manifest directory exists with at least 1 skill pack registered
- Collective Fund application draft exists

**Rollback:** Remove the files. No production code impact.

---

## P0 Task List

| # | Task | Impact | Files |
|---|---|---|---|
| P0-1 | Fix MCP schema stripping | **Critical** — MCP tools invisible to clients | `mcp/server.ts`, `mcp/package.json` |
| P0-2 | Fix README claims vs reality | High — trust issue for new users | `README.md`, `vercel-ai-agent/package.json`, `vercel-ai-agent/app/api/chat/route.ts` |
| P0-3 | Remove CLI `run` stub | Medium — misleading UX | `cli/src/index.ts` |
| P0-4 | CI validates build artifacts | High — broken deploy risk | `.github/workflows/ci.yml` |
| P0-5 | Skill pack manifests + safe mode | Medium — discoverability + safety | `skill-packs/*/manifest.yaml`, `skill-packs/index.yaml`, `core/src/agent-runner.ts` |
| P0-6 | Add zod-to-json-schema dep for MCP | Part of P0-1 | `mcp/package.json` |

---

## README Claim vs Reality Inconsistencies

| README Statement | Reality | Severity |
|---|---|---|
| "6 framework adapters" | 5 functional (vercel-ai, langchain, mcp, cli, core/agent-runner) + 1 unproven (google-adk — no real SDK dep) | Medium |
| "Provider-agnostic — Gemini (free tier), Anthropic, OpenAI — auto-detected" | Agent runner code exists, but was never verified with a real LLM key (Gemini quota exhausted during testing) | Medium |
| "MCP-native — Works with Claude Code, Codex, Cursor, Windsurf, Cody, Claude Desktop" | MCP server works **functionally** but with **stripped schemas** so parameter types won't show in any client | **HIGH** |
| "Python bindings — Coming soon" | Accurate — clearly marked as coming soon | None |
| "62 Tools across 15 API groups" | **Accurate** — verified by file audit | None |
| "All 6 packages published to npm" | **Accurate** — verified by `npm info` | None |
| "30 tests passing" | **Accurate** — but all in core only, zero in adapters | Low |
| "Skill Packs — Pre-built recipes" | Partially accurate — markdown docs exist but no executable code or manifests | Low |

---

## Recommended Stable Package Scope for v0.1.0

Based on the audit, only these packages should ship as **stable** in v0.1.0:

### Stable (ready with fixes)

| Package | Reason |
|---|---|
| `@webflow-agent-kit/core` | 62 tools, 30 tests, fully verified against live Webflow API |
| `@webflow-agent-kit/vercel-ai` | Real adapter, used by functional demo |
| `@webflow-agent-kit/langchain` | Real adapter, used by functional demo |
| `@webflow-agent-kit/mcp` | Real MCP server — **after P0-1 fix** for schema stripping |
| `@webflow-agent-kit/cli` | Real `auth` and `sites` commands — **after P0-3 fix** to remove `run` stub |

### Beta (ship with caveats)

| Package | Reason |
|---|---|
| `@webflow-agent-kit/google-adk` | Shape is plausible but unproven — mark as "Beta: real integration pending" |

### Excluded from v0.1.0

| Package | Reason |
|---|---|
| `webflow-agent-kit-python` | Pure placeholder — all methods return hardcoded data. Mark as "Coming soon" only |

### v0.1.0 scope summary

```
Stable:   core, vercel-ai, langchain, mcp, cli           (5 packages)
Beta:     google-adk                                      (1 package)
Excluded: webflow-agent-kit-python                        (not a package)
```

---

*Plan written by Anil Pervaiz — anilpervaiz.com*
