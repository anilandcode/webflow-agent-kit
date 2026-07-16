# Compatibility

## Supported Runtimes

| Runtime | Version | Status |
|---|---|---|
| Node.js | 18, 20, 22 | Supported |
| Node.js | 23+ | Not tested |
| Deno | — | Not supported |
| Bun | — | Not tested |

## TypeScript

- Minimum: TypeScript 5.0
- `strict: true` enforced for source
- ESM + CJS dual output (tsup)

## Framework Support

| Adapter Package | Framework | Version | Status |
|---|---|---|---|
| `@webflow-agent-kit/vercel-ai` | Vercel AI SDK (`ai`) | >= 4.0.0 | **Stable** |
| `@webflow-agent-kit/langchain` | LangChain (`@langchain/core`) | >= 0.3.0 | **Beta** — shape-compatible, no integration tests |
| `@webflow-agent-kit/google-adk` | Google ADK | N/A | **Beta** — no Google ADK SDK dependency, shape-compatible |
| `@webflow-agent-kit/mcp` | MCP (`@modelcontextprotocol/sdk`) | >= 1.6.0 | **Stable** — functional, parameter schemas simplified |
| `@webflow-agent-kit/cli` | Commander.js | >= 13.0.0 | **Stable** |

## MCP Clients

The MCP protocol is universal. Tested configurations:

| Client | Config Location | Status |
|---|---|---|
| Claude Code | `~/.claude/mcp.json` | Supported |
| Claude Desktop | `claude_desktop_config.json` | Supported |
| Codex | `~/.codex/mcp.json` | Config documented, not integration-tested |
| Cursor | Settings → MCP | Config documented, not integration-tested |
| Windsurf | Settings → MCP Servers | Config documented, not integration-tested |

## Python

- `webflow-agent-kit-python`: **Pre-alpha** — all adapters return `NotImplementedError`
- Python 3.10, 3.11, 3.12 are tested in CI

## Skill Packs

| Skill | Status | Mutation Risk |
|---|---|---|
| SEO Audit | Stable | Low |
| Publish Workflow | Stable | Medium |
| Content Migration | Experimental | High |
| Ecommerce Sync | Experimental | High |

## Webflow API

- SDK: `webflow-api` ^3.2.0 (auto-generated from Data API v2 spec)
- The SDK can have breaking changes within minor versions — pin to a known-good version in production
- Enterprise-only endpoints: redirects, robots.txt, well-known files — return 403 on non-Enterprise plans

[Full dependency compatibility matrix →](dependency-compatibility.md)
