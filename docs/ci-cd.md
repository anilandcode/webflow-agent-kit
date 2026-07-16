# CI/CD — webflow-agent-kit

All workflows run on GitHub Actions. Every PR must pass all checks before merge.

## Workflows

### `ci.yml` — TypeScript + MCP + Python + Docs

Runs on every push to `main` and every pull request.

| Job | What it checks | Concurrency |
|---|---|---|
| **TS Quality** | `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`, `pnpm build` on Node 20 and Node 22 (matrix) | Cancelled on new PR pushes |
| **Package Smoke** | Packs every npm package into a tarball, installs it into a clean temp project, verifies successful install. Checks that `workspace:*` references are resolved | After quality |
| **MCP Protocol Smoke** | Starts `@webflow-agent-kit/mcp` with a fake token, sends MCP `initialize` + `tools/list` requests, verifies tool names appear in output | After quality |
| **Python Quality** | `ruff`, `mypy`, `pytest`, `python -m build`, `twine check` on Python 3.10, 3.11, and 3.12 (matrix). Only runs when Python files change, `[python]` is in the commit message, or on `main` pushes | After quality |
| **Docs Build** | Builds the Astro Starlight docs-site. Only runs when docs/skill-packs/README change, `[docs]` is in the commit message, or on `main` pushes | After quality |

### `security.yml` — CodeQL + Dependency Review

| Job | Frequency |
|---|---|
| **CodeQL TypeScript** | Every push/PR + weekly on `main` |
| **CodeQL Python** | Every push/PR + weekly on `main` |
| **Dependency Review** | Every PR |

### `release.yml` — Changesets + NPM Publish

| Job | What it does |
|---|---|
| **Quality Gate** | Runs full lint, typecheck, test, build before any publish |
| **Release** | Smoke tests all packages (pack verification), then uses Changesets to version and publish. Only runs after quality gate passes |

### Dependabot (`.github/dependabot.yml`)

Keeps dependencies updated weekly:

| Ecosystem | Directory |
|---|---|
| npm (monorepo root) | `/` |
| npm (Next.js demo) | `/examples/vercel-ai-agent` |
| pip (Python package) | `/webflow-agent-kit-python` |
| GitHub Actions | `/` |

## Permissions

All workflows use `permissions: contents: read` by default. The release workflow additionally needs `contents: write`, `pull-requests: write`, and `id-token: write` for Changesets and npm publish.

## Required Secrets

| Secret | Used By | Purpose |
|---|---|---|
| `NPM_TOKEN` | Release workflow | Publishes packages to npm (`@webflow-agent-kit/*`). Must be a granular token with publish access. If not set, the release workflow runs Changesets but does not publish. |
| `GITHUB_TOKEN` | Release workflow | Auto-provided by GitHub. Used by Changesets for creating PRs and commits. |

No other secrets are required. No production Webflow API keys are used in CI.

## How to Reproduce Locally

### TypeScript quality

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
```

### Package smoke

```bash
pnpm build
cd packages/core && pnpm pack --pack-destination /tmp/test
cd /tmp/test && mkdir core && cd core && npm init -y && npm install /tmp/test/webflow-agent-kit-core-*.tgz
# Repeat for each package
```

### MCP smoke

```bash
WEBFLOW_TOKEN=fake-token node packages/mcp/dist/server.js
# Send: {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}
# Send: {"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}
```

### Python quality

```bash
cd webflow-agent-kit-python
python -m pip install -e '.[dev]'
ruff check .
mypy webflow_agent_kit
pytest
python -m build
python -m twine check dist/*
```

### Docs build

```bash
cd docs-site
npm install
npm run build
```

## YAML Validation

All workflow files use standard GitHub Actions YAML syntax. Validate locally:

```bash
# Using actionlint (recommended)
brew install actionlint
actionlint .github/workflows/*.yml

# Or check GitHub's web validator at:
# https://rhysd.github.io/actionlint/
```
