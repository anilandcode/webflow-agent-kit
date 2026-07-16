# Contributing to webflow-agent-kit

## Development Setup

**Required:** Node.js 20 or 22, pnpm 9.15.4 (or later v9.x), Corepack enabled.

```bash
# Enable Corepack (ships with Node 16+)
corepack enable

# Clone
git clone https://github.com/anilandcode/webflow-agent-kit.git
cd webflow-agent-kit

# Install (Corepack auto-selects the pnpm version from pnpm-workspace.yaml)
pnpm install

# Build all packages
pnpm build

# Typecheck
pnpm typecheck

# Lint
pnpm lint

# Run all tests
pnpm test

# Run tests for a single package
pnpm --filter @webflow-agent-kit/core test
pnpm --filter @webflow-agent-kit/skills test
```

## Project Structure

```
packages/
├── core/          — 62 tools, auth, rate limiting, mutation policy
├── vercel-ai/     — Vercel AI SDK adapter
├── langchain/     — LangChain adapter (beta)
├── google-adk/    — Google ADK adapter (beta)
├── mcp/           — MCP server (Claude Code, Codex, Cursor)
├── cli/           — CLI runner (wfak)
└── skills/        — Manifest-backed safe workflow packs

examples/
├── vercel-ai-agent/  — Next.js chat demo
├── langchain-agent/  — LangChain agent demo
├── mcp-claude-desktop/ — Claude Desktop MCP config
└── cli-quickstart/   — CLI demo

skill-packs/
├── seo-audit/         — Stable skill
├── publish-workflow/  — Stable skill
├── content-migration/ — Experimental
└── ecommerce-sync/    — Experimental

docs/               — All documentation
docs-site/          — Astro Starlight docs site
webflow-agent-kit-python/ — Python companion (pre-alpha)
```

## Quick Commands

```bash
pnpm build          # Build all packages
pnpm typecheck      # Type-check all packages
pnpm test           # Run all tests
pnpm lint           # ESLint
pnpm format         # Prettier format
pnpm format:check   # Prettier dry-run

# Single package
pnpm --filter @webflow-agent-kit/core build
pnpm --filter @webflow-agent-kit/core test

# Watch mode
pnpm --filter @webflow-agent-kit/core test:watch
pnpm --filter @webflow-agent-kit/core dev
```

## Running the Docs Site

```bash
cd docs-site
npm install
npm run dev   # http://localhost:4321
```

## Running the Chat Demo

```bash
cd examples/vercel-ai-agent
echo "WEBFLOW_TOKEN=your_token" > .env.local
echo "GOOGLE_GENERATIVE_AI_API_KEY=your_key" >> .env.local
pnpm dev   # http://localhost:3000
```

## Environment Variables

Create `.env` files in the repository root or individual example directories. Never commit `.env` files — `.gitignore` is configured to exclude them.

```bash
# Required for running integration tests or the demo
WEBFLOW_TOKEN=your_token_here

# Optional — required for the chat demo
GOOGLE_GENERATIVE_AI_API_KEY=your_key  # Gemini free tier
# or ANTHROPIC_API_KEY=your_key         # Claude
# or OPENAI_API_KEY=your_key            # GPT
```

## Adding a New Tool

1. Create `packages/core/src/tools/your-group.ts`
2. Follow the pattern in `sites.ts` — each tool returns `{ name, description, inputSchema, execute }`
3. Export from `packages/core/src/tools/index.ts`
4. Add the group to each adapter's ToolGroup type and wiring (see `vercel-ai/src/index.ts` for reference)
5. Add a smoke test in `packages/core/src/__tests__/tools-integration.test.ts`
6. Run `pnpm typecheck && pnpm test` to verify

## Adding a New Skill Pack

1. Create `skill-packs/<id>/skill.yaml` with full manifest
2. Create `skill-packs/<id>/src/index.ts` implementing the `Skill` interface
3. Create `skill-packs/<id>/prompts/system.md` for the LLM prompt
4. Add tests in `packages/skills/src/__tests__/<id>.test.ts`
5. Run `pnpm --filter @webflow-agent-kit/skills test`

## Commit Convention

[Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New tool, adapter, or skill
- `fix:` — Bug fix
- `docs:` — Documentation
- `chore:` — Build, CI, deps
- `refactor:` — Code restructuring
- `ci:` — Workflow changes
- `test:` — Test additions

## Pull Request Checklist

- [ ] TypeScript compiles without errors (`pnpm typecheck`)
- [ ] Tests pass (`pnpm test`)
- [ ] Lint passes (`pnpm lint`)
- [ ] Format check passes (`pnpm format:check`)
- [ ] New tools have Zod schemas
- [ ] New tools have LLM-friendly descriptions
- [ ] New tools are classified in `tool-classification.ts`
- [ ] Adapter packages updated if adding new tool groups
- [ ] `docs/dependency-compatibility.md` updated if deps change
- [ ] `README.md` tool groups table updated if tool count changes

## Documentation Maintenance Checklist

When you make any of these changes, update the corresponding docs:

| Change | Update |
|---|---|
| New tool group added | `README.md` tool groups table, `docs/tool-reference.md` |
| Dependency version change | `docs/dependency-compatibility.md` |
| New adapter package | `README.md` packages table, `docs/framework-adapters.md` |
| Policy/mode change | `docs/safety-and-mutations.md` |
| New skill pack | `README.md` skill packs table |
| CI workflow change | `docs/ci-cd.md` |
| Publishing process change | `docs/releasing.md` |

## Questions?

Open an [issue](https://github.com/anilandcode/webflow-agent-kit/issues).
