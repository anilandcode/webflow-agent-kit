# Troubleshooting

## Environment

### `Node not found` or wrong version

webflow-agent-kit requires Node.js 18+. Check your version:

```bash
node --version   # Should be >= 18
which node       # Verify correct installation
```

On macOS, avoid the version that ships with Xcode. Use `nvm`, `fnm`, or `brew install node@22`.

### `pnpm not found`

Enable Corepack (ships with Node 16+):

```bash
corepack enable
pnpm --version
```

### `npm not found`

If you installed Node via nvm and npm is missing:

```bash
nvm install 22
nvm use 22
```

## Imports

### `Cannot use import statement outside a module`

Your project's `package.json` must have `"type": "module"` or you must use `.mjs` extensions.

```json
{ "type": "module" }
```

### `Cannot find module @webflow-agent-kit/core`

The package is not installed. Run:

```bash
npm install @webflow-agent-kit/core
```

If you cloned the repo, run:

```bash
pnpm install
pnpm build
```

Workspace packages (`workspace:*`) are only resolved within the pnpm monorepo. They are resolved to real versions during `pnpm pack` and `npm publish`.

## MCP

### MCP server starts but tools don't appear

The MCP server was built but the schema bug strips parameter types. The server is functional — tools execute correctly, but parameter hints may be simplified.

### MCP config location

| Client | Config File |
|---|---|
| Claude Code | `~/.claude/mcp.json` |
| Codex | `~/.codex/mcp.json` |
| Claude Desktop | `claude_desktop_config.json` (Help → Developer → Edit Config) |
| Cursor | Settings → MCP → Add Server |
| Windsurf | Settings → MCP Servers |

## Webflow API Errors

### 401 Unauthorized

- Verify `WEBFLOW_TOKEN` is set and correct
- Check the token has not been revoked in Webflow Site Settings → API Access
- For OAuth: the user may have revoked access — re-authorize

### 403 Forbidden

- Your token may be missing required scopes (see [Authentication → Scopes](authentication.md#scopes-required-by-tool-group))
- The endpoint may be Enterprise-only (redirects, robots.txt, well-known files)
- Custom code endpoints require an OAuth token — site tokens return 403

### 404 Not Found

- Verify the resource ID is correct (site ID, collection ID, page ID, item ID)
- The resource may have been deleted

### 409 Conflict

Common causes:
- The site has not been published yet (trying to publish an item requires the site to be published)
- Ecommerce is not initialized on the site (create a product first in the Designer)
- Forms are not enabled (add a form to the published site)

### 429 Rate Limited

- Free/Starter plans: 60 requests/minute
- CMS/Business plans: 120 requests/minute
- The built-in rate limiter handles most 429s automatically
- If you hit limits repeatedly, configure the rate limiter with `maxRequests: 60`

## Token Security

- **Never commit tokens to source control**
- Use `.env` files (gitignored) for local development
- Redact tokens in logs and screenshots
- Rotate tokens regularly (generate new, verify, delete old)
- Use minimum required scopes (see [Authentication](authentication.md))

## Build and Packaging

### `pnpm build` fails

```bash
rm -rf node_modules packages/*/dist
pnpm install
pnpm build
```

### `Cannot find module` after install

The package was published without its `dist/` directory. Check the `files` field in `package.json`:

```json
"files": ["dist", "README.md"]
```

If you're developing locally, run `pnpm build` before importing.

### Workspace dependency leak

`workspace:*` references in `package.json` are resolved during `pnpm pack` and `npm publish`. They should never appear in published package manifests. If they do, the publish step is broken.

## Gemini API

### 429 Quota Exhausted

Gemini's free tier has a daily limit of 1,500 requests. If you hit it:

1. Wait for the quota to reset (up to 24 hours)
2. Create a new API key in a different Google Cloud project at [aistudio.google.com](https://aistudio.google.com/apikey)
3. Enable billing for higher limits

### Model not found

Use `gemini-2.0-flash` — that's the tested model. Newer models may require SDK version updates.
