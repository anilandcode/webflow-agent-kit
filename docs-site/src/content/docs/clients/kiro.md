# Kiro CLI Setup

> **Status:** Experimental — MCP protocol verified; Kiro CLI integration is untested.

Kiro is an AI-powered CLI that supports MCP. This config uses the generic stdio transport.

## Prerequisites

- Node.js 18+
- [Kiro CLI](https://kiro.dev) installed (community link — verify before following)
- A Webflow [site token](https://developers.webflow.com/data/docs/getting-started#authentication)

## Setup

Consult Kiro's documentation for the correct MCP config location. Once found, add:

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

The MCP server is protocol-verified. Kiro CLI integration is experimental — no community member has tested this setup. If you try it, please report.

## Troubleshooting

See [generic MCP troubleshooting](generic-mcp.md).
