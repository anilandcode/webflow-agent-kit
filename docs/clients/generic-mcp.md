# Generic MCP Client Setup

Any MCP-compatible client that uses the standard `StdioServerTransport` can connect to `@webflow-agent-kit/mcp@beta`.

## Standard Config

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

## How It Works

1. Your MCP client starts the `npx @webflow-agent-kit/mcp@beta` process
2. The server communicates via stdio (stdin/stdout) using JSON-RPC
3. On startup, the server lists all 62 tools via `tools/list`
4. Your client can then call any tool via `tools/call`

## Troubleshooting

### "Command not found: npx"

npx ships with Node.js. Verify Node 18+ is installed:

```bash
node --version  # Should be >= 18
which npx       # Should resolve
```

### "401 Unauthorized"

Your `WEBFLOW_TOKEN` is missing, incorrect, or expired. Generate a new one:

1. Go to Webflow → Site Settings → Apps & Integrations → API Access
2. Click "Generate API Token"
3. Copy the token and set it as `WEBFLOW_TOKEN`

### Server starts but tools don't appear

The MCP server has a known issue where parameter type schemas are simplified (P0 fix pending). Tools still execute correctly — the issue only affects tool parameter hints in some clients.

### "Module not found" / "Cannot find package"

Ensure the `@beta` tag is specified. `@latest` points to the v0.0.x stable release which may not include all features.

## Verified

✅ MCP protocol smoke test passes: `initialize` + `tools/list` returns 62 tools including `webflow_list_sites`.
