# Claude Code Setup

Claude Code is verified and tested with `@webflow-agent-kit/mcp@beta`.

## Prerequisites

- Node.js 18+
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed
- A Webflow [site token](https://developers.webflow.com/data/docs/getting-started#authentication)

## Setup

Create or edit `~/.claude/mcp.json`:

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

Replace `<YOUR_WEBFLOW_SITE_TOKEN>` with your actual Webflow site token. Never commit this file.

## Verify

Start Claude Code and send:

```
> List my Webflow sites. Do not make changes.
```

You should see your sites listed.

## Troubleshooting

**"MCP server not found"** — ensure `npx` is available. Run `which npx` to verify.

**"401 Unauthorized"** — your `WEBFLOW_TOKEN` may be incorrect or expired. Generate a new one from Webflow Site Settings → Apps & Integrations → API Access.

**"Module not found"** — ensure the `@beta` tag is specified. `@latest` points to the stable (older) release.

## Verified

✅ Tested with Claude Code on macOS and Linux. MCP protocol smoke test passes (62 tools).
