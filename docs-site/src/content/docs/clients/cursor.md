# Cursor Setup

> **Status:** Beta — tested through MCP protocol smoke; Cursor Desktop integration requires user verification.

Cursor supports MCP servers through its Settings panel.

## Prerequisites

- Node.js 18+
- [Cursor](https://cursor.sh) installed
- A Webflow [site token](https://developers.webflow.com/data/docs/getting-started#authentication)

## Setup

1. Open Cursor → Settings → MCP
2. Add new MCP server with this config:

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

## Verify

```
> List my Webflow sites. Do not make changes.
```

## Status

The MCP server is protocol-verified (62 tools respond correctly). Cursor's specific MCP UI integration has not been tested by a community member yet. If you test it, please report your experience.

## Troubleshooting

See [generic MCP troubleshooting](generic-mcp.md).
