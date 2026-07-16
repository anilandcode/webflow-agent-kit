# @webflow-agent-kit/mcp

Standalone MCP server for webflow-agent-kit.

## Install

```bash
npm install @webflow-agent-kit/mcp
```

## Usage

Start the MCP server:

```bash
WEBFLOW_TOKEN=your_token npx @webflow-agent-kit/mcp
```

Or connect via MCP config (Claude Code, Codex, Cursor):

```json
{
  "mcpServers": {
    "webflow": {
      "command": "npx",
      "args": ["-y", "@webflow-agent-kit/mcp@latest"],
      "env": { "WEBFLOW_TOKEN": "<YOUR_TOKEN>" }
    }
  }
}
```

See the [main README](https://github.com/anilandcode/webflow-agent-kit) for full documentation.
