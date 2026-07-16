# Python Package Status — webflow-agent-kit

> **Last updated:** 2026-07-16
> **Status:** EXPERIMENTAL / PRE-ALPHA

## Current Limitations

1. **No MCP transport.** The package does not start or communicate with the TypeScript MCP server (`@webflow-agent-kit/mcp`). The `mcp` dependency was removed in the pre-alpha cleanup.

2. **No tool registry.** There is no list of tools, groups, or schemas available in Python. The TypeScript packages (`@webflow-agent-kit/core`) are the source of truth for tool definitions.

3. **No framework adapters.** All three adapter methods (`to_openai_sdk`, `to_langchain`, `to_crewai`) raise `NotImplementedError`. No real conversion to any Python AI framework exists.

4. **No automated tests for adapter behavior.** Tests only verify that unimplemented methods fail loudly and that basic auth validation works.

## Supported Python Versions

| Version | Status |
|---|---|
| 3.10 | Supported |
| 3.11 | Supported |
| 3.12 | Supported |
| 3.13 | Not tested |

## Proposed Architecture Options

### Option A: MCP Subprocess (Recommended)

The TypeScript MCP server starts as a subprocess. Python communicates via stdio using the MCP JSON-RPC protocol.

**Pros:** Reuses all 62 existing tools, single source of truth.
**Cons:** Requires Node.js runtime, adds subprocess management complexity.

### Option B: Direct API Calls

Python calls the Webflow REST API directly, duplicating tool logic.

**Pros:** No TypeScript dependency.
**Cons:** Duplicates 62 tool implementations, two codebases to maintain.

### Option C: HTTP Bridge

The MCP server runs as a standalone HTTP server. Python calls it via `requests`/`httpx`.

**Pros:** Clean separation, works across machines.
**Cons:** Requires server management, additional deployment step.

## No-Production-Use Warning

**Do not install this package in production environments.** All methods that would perform real work raise `NotImplementedError`. The only working behavior is `WebflowAgentKit.from_env()` which validates that a `WEBFLOW_TOKEN` environment variable is set.

For production use of webflow-agent-kit, install the TypeScript packages:

```bash
npm install @webflow-agent-kit/core @webflow-agent-kit/vercel-ai
```

See the [main README](https://github.com/anilandcode/webflow-agent-kit) for production setup instructions.
