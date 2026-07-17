# Codex CLI Setup

Codex CLI is verified and tested with `@webflow-agent-kit/mcp@beta`.

## Prerequisites

- Node.js 18+
- [Codex CLI](https://github.com/openai/codex) installed
- A Webflow [site token](https://developers.webflow.com/data/docs/getting-started#authentication)

## Setup

Add to `~/.codex/mcp.json`:

```json
{
  "mcpServers": {
    "webflow-agent-kit": {
      "command": "npx",
      "args": ["-y", "@webflow-agent-kit/mcp@beta"],
      "env": {
        "WEBFLOW_TOKEN": "<YOUR_WEBFLOW_SITE_TOKEN>"
      }
    }
  }
}
```

If your Codex version uses a Settings panel, add the config via Settings → MCP Servers.

## Verify

```
codex> List my Webflow sites. Do not make changes.
```

## Troubleshooting

**"server not found"** — ensure `npx` is available: `which npx`.

**"401 Unauthorized"** — regenerate your Webflow site token.

## Verified

✅ MCP protocol smoke test passes with Codex-compatible JSON-RPC. Uses the standard stdio MCP transport.
