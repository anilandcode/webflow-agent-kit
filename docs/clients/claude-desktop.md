# Claude Desktop Setup

> **Status:** Beta — tested through MCP protocol smoke; Claude Desktop integration requires user verification.

Claude Desktop supports MCP servers through its developer settings.

## Prerequisites

- Node.js 18+
- [Claude Desktop](https://claude.ai/download) installed
- A Webflow [site token](https://developers.webflow.com/data/docs/getting-started#authentication)

## Setup

1. Open Claude Desktop → Help → Developer → Edit Config
2. This opens `claude_desktop_config.json`
3. Add:

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

Restart Claude Desktop and send:

```
> List my Webflow sites. Do not make changes.
```

## Status

The MCP server is protocol-verified. Claude Desktop's specific MCP integration has known limitations — parameter type schemas are simplified (see [production readiness plan](../production-readiness-plan.md)).

## Troubleshooting

- **Tools don't appear**: Restart Claude Desktop after editing the config
- **Parameter types missing**: This is a known P0 issue — the server returns simplified schemas. Tools still execute correctly.
