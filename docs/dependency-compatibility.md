# Dependency Compatibility Matrix — webflow-agent-kit

## NPM Packages

| Package | Runtime Deps | Peer Deps | Node.js |
|---|---|---|---|
| `@webflow-agent-kit/core` | `webflow-api` ^3.2.0, `zod` ^3.23.0 | `typescript` >=5.0 | >=18 |
| `@webflow-agent-kit/vercel-ai` | `@webflow-agent-kit/core` workspace:\* | `ai` >=4.0.0 | >=18 |
| `@webflow-agent-kit/langchain` | `@webflow-agent-kit/core` workspace:\* | `@langchain/core` >=0.3.0 (optional), `zod` >=3.23.0 (optional) | >=18 |
| `@webflow-agent-kit/google-adk` | `@webflow-agent-kit/core` workspace:\* | `zod` >=3.23.0 (optional) | >=18 |
| `@webflow-agent-kit/mcp` | `@webflow-agent-kit/core` workspace:\*, `@modelcontextprotocol/sdk` ^1.6.0, `zod` ^3.23.0 | — | >=18 |
| `@webflow-agent-kit/cli` | `@webflow-agent-kit/core` workspace:\*, `commander` ^13.0.0 | — | >=18 |
| `@webflow-agent-kit/skills` | `@webflow-agent-kit/core` workspace:\*, `zod` ^3.23.0 | — | >=18 |

## Framework Versions

| Framework | Minimum | Tested | Adapter Package |
|---|---|---|---|
| Vercel AI SDK (`ai`) | 4.0.0 | 4.3.19 | `@webflow-agent-kit/vercel-ai` |
| LangChain (`@langchain/core`) | 0.3.0 | 0.3.x | `@webflow-agent-kit/langchain` |
| Google ADK | N/A (no SDK dep) | N/A (beta) | `@webflow-agent-kit/google-adk` |
| MCP (`@modelcontextprotocol/sdk`) | 1.6.0 | 1.6.x | `@webflow-agent-kit/mcp` |
| Commander.js | 13.0.0 | 13.x | `@webflow-agent-kit/cli` |

## Key Versions

| Dependency | Range | Why |
|---|---|---|
| `webflow-api` | ^3.2.0 | Official Webflow SDK. v3.x auto-generates from Data API spec. Breaking changes possible within minor versions — pin to a known-good version in production. |
| `zod` | ^3.23.0 | Single source of truth for all schemas. No duplication across packages — all use the same range. `v4` is not yet tested. |
| `ai` | >=4.0.0 (peer) | Vercel AI SDK. Consumers install their own version. v5 migrated spec format; the adapter is compatible with v4 shapes. |
| `@modelcontextprotocol/sdk` | ^1.6.0 | Official MCP SDK. Breaking changes have occurred across minor versions. Pin in production. |

## Package Compatibility

| Package | publishConfig.access | Dist Tag | Status |
|---|---|---|---|
| core | public | latest | Stable |
| vercel-ai | public | latest | Stable |
| langchain | public | latest | Beta |
| google-adk | public | latest | Beta |
| mcp | public | latest | Stable |
| cli | public | latest | Stable |
| skills | public | latest | Stable |
