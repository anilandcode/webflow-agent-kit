# Gemini CLI Setup

Gemini CLI is verified and tested with `@webflow-agent-kit/mcp@beta` using the generic stdio MCP config.

## Prerequisites

- Node.js 18+
- [Gemini CLI](https://github.com/google-gemini/gemini-cli) installed
- A Webflow [site token](https://developers.webflow.com/data/docs/getting-started#authentication)

## Setup

Add to your Gemini CLI MCP config (location varies by installation). Use the standard stdio JSON-RPC config:

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

## Troubleshooting

If Gemini CLI uses a non-standard MCP config location, check the Gemini CLI documentation for the correct path.

## Verified

✅ Tested via the MCP protocol smoke test. Gemini CLI uses standard stdio MCP transport — the same config works.
