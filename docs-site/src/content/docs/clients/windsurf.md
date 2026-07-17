# Windsurf Setup

> **Status:** Beta — tested through MCP protocol smoke; Windsurf integration requires community verification.

Windsurf supports MCP servers through Settings → MCP Servers.

## Prerequisites

- Node.js 18+
- [Windsurf](https://codeium.com/windsurf) installed
- A Webflow [site token](https://developers.webflow.com/data/docs/getting-started#authentication)

## Setup

1. Open Windsurf → Settings → MCP Servers
2. Add:

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

## Status

The MCP protocol smoke test passes (62 tools). Windsurf-specific integration has not been community-verified yet. If you test it, please report.

## Troubleshooting

See [generic MCP troubleshooting](generic-mcp.md).
