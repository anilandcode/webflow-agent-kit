# Testing

## Test Commands

```bash
# All tests
pnpm test

# Single package
pnpm --filter @webflow-agent-kit/core test
pnpm --filter @webflow-agent-kit/skills test

# Watch mode
pnpm --filter @webflow-agent-kit/core test:watch
```

## Test Locations

| Package | Test Count | Location |
|---|---|---|
| `core` | 71 | `packages/core/src/__tests__/` |
| `skills` | 29 | `packages/skills/src/__tests__/` |
| `vercel-ai` | 0 | — |
| `langchain` | 0 | — |
| `google-adk` | 0 | — |
| `mcp` | 0 | — |
| `cli` | 0 | — |
| `python` | 11 | `webflow-agent-kit-python/tests/` |

## Test Categories

### Unit Tests (core)

- **auth:** Token resolution, error on missing `WEBFLOW_TOKEN`
- **bulk:** `chunkItems` with custom/default/empty sizes
- **errors:** Error hierarchy, type guards
- **rate-limiter:** Default config, custom config, `acquire()` execution
- **tool-classification:** All 62 tools classified, `getItemCount`, `getSiteId`
- **mutation-policy:** Allow/deny for all modes, group allowlists, site allowlists, bulk limits, approval, audit hooks, redaction
- **tools-integration:** 15 smoke tests — one per tool group with mocked clients

### Unit Tests (skills)

- **types:** Manifest validation, risk levels, mode validation
- **executor:** Dry-run prevents writes, confirmation required, token stability
- **seo-audit:** Dry-run, plan determinism, execute with confirmation, input validation
- **publish-workflow:** Dry-run, plan determinism, execute with approved IDs, rollback

### Python Tests

- **package:** Import, `from_env` with/without token, `NotImplementedError` on all adapters, explicit constructors

## Running Integration Tests

Integration tests require a real Webflow API token. They are not run in CI.

```bash
WEBFLOW_TOKEN=your_token pnpm --filter @webflow-agent-kit/core test
```

Integration tests create and delete test CMS collections — they clean up after themselves even on failure.

## Coverage

Vitest coverage is configured but not enforced as a gate:

```bash
pnpm --filter @webflow-agent-kit/core test:coverage  # Not configured yet
```

## Writing Tests

- Use Vitest for TypeScript tests
- Mock `WebflowClient` for tool-level tests — see `tools-integration.test.ts` for patterns
- Mock skill clients following the `SeoAuditClient` and `PublishWorkflowClient` interfaces
- Python tests use `pytest` with `monkeypatch` for environment variables

## CI Matrix

Tests run on Node 20 and 22 in CI. Python tests run on 3.10, 3.11, and 3.12.

See [ci-cd.md](ci-cd.md) for the full CI pipeline.
