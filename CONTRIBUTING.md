# Contributing to webflow-agent-kit

Thanks for contributing! Here's how to get set up.

## Development Setup

```bash
# Clone
git clone https://github.com/anilandcode/webflow-agent-kit.git
cd webflow-agent-kit

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint
pnpm lint
```

## Project Structure

```
packages/
├── core/         — Tool definitions, auth, rate limiting
├── vercel-ai/    — Vercel AI SDK adapter
├── langchain/    — LangChain adapter
├── mcp/          — MCP server
└── cli/          — CLI runner
```

## Adding a New Tool

1. Create the tool file in `packages/core/src/tools/`
2. Follow the existing pattern (see `sites.ts` for reference)
3. Export from `packages/core/src/tools/index.ts`
4. Add the tool group to each adapter (`vercel-ai`, `langchain`, `mcp`)
5. Add tests in `packages/core/src/__tests__/`
6. Run `pnpm typecheck && pnpm test` to verify

## Tool Pattern

Every tool follows this pattern:

```typescript
export function createMyTool(client: WebflowClient) {
  return {
    name: 'webflow_action_name',           // Unique snake_case name
    description: 'What this tool does...',  // LLM-friendly description
    inputSchema: z.object({                 // Zod schema
      param: z.string().describe('What this param is'),
    }),
    execute: async ({ param }) => {         // Execution function
      const result = await client.some.api.call(param);
      return { result };
    },
  };
}
```

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New tool or adapter
- `fix:` — Bug fix
- `docs:` — Documentation
- `chore:` — Build, CI, deps
- `refactor:` — Code restructuring

## Pull Request Checklist

- [ ] TypeScript compiles without errors (`pnpm typecheck`)
- [ ] Tests pass (`pnpm test`)
- [ ] Lint passes (`pnpm lint`)
- [ ] New tools have Zod schemas
- [ ] New tools have LLM-friendly descriptions
- [ ] Adapter packages updated if adding new tool groups

## Questions?

Open a [discussion](https://github.com/anilandcode/webflow-agent-kit/discussions) or [issue](https://github.com/anilandcode/webflow-agent-kit/issues).
