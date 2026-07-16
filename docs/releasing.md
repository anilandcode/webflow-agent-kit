# Releasing

## How Releases Work

webflow-agent-kit uses [Changesets](https://github.com/changesets/changesets) for versioning and publishing. The release workflow (`release.yml`) runs on every push to `main`.

## Release Flow

1. **Create a changeset** on your feature branch:

```bash
pnpm changeset
```

This prompts you to select which packages changed and whether it's a major/minor/patch bump.

2. **Merge to `main`.** The Changesets GitHub Action creates a "Version Packages" PR.

3. **Merge the Version Packages PR.** This bumps versions, updates changelogs, and publishes to npm.

## Manual Publish

If the automated workflow fails, you can publish from your local machine:

```bash
# Log into npm
npm login

# Build all packages
pnpm build

# Publish each package
cd packages/core && npm publish --access public
cd packages/vercel-ai && npm publish --access public
cd packages/langchain && npm publish --access public
cd packages/google-adk && npm publish --access public
cd packages/mcp && npm publish --access public
cd packages/cli && npm publish --access public
cd packages/skills && npm publish --access public
```

## Pre-Publish Checklist

Before publishing:

- [ ] All tests pass: `pnpm test`
- [ ] Typecheck passes: `pnpm typecheck`
- [ ] Lint passes: `pnpm lint`
- [ ] Format check passes: `pnpm format:check`
- [ ] All packages build: `pnpm build`
- [ ] Exported APIs are backwards-compatible (no removed exports without a major bump)
- [ ] `docs/dependency-compatibility.md` is updated
- [ ] `README.md` tool count and adapter count are accurate
- [ ] Skill pack manifests are validated

## Version Policy

- **Patch (0.0.x):** Bug fixes, documentation, CI changes
- **Minor (0.x.0):** New tools, new adapters, new features
- **Major (x.0.0):** Breaking API changes, removed exports

Until v1.0.0, the API surface is considered **beta** and may change across minor versions. Breaking changes will be documented in the changelog.

## Required Secrets

| Secret | Purpose |
|---|---|
| `NPM_TOKEN` | Publishes packages to npm. Must be a granular token with publish access for `@webflow-agent-kit/*`. |
| `GITHUB_TOKEN` | Auto-provided by GitHub. Used by Changesets for creating PRs. |

## Dist Tags

By default, packages are published with the `latest` tag. Beta packages should use:

```bash
npm publish --tag beta
```

Currently, `langchain` and `google-adk` adapters are published as `latest` but documented as **Beta** in the README. Consider switching them to the `beta` dist tag.

## Python Package

The Python package (`webflow-agent-kit-python`) is **not published**. It's a pre-alpha scaffold. Do not publish it to PyPI. When it's ready, follow the Python release workflow in `docs/python-status.md`.

## Rollback

If a published version is broken:

1. **Unpublish** (npm allows unpublishing within 72 hours):

```bash
npm unpublish @webflow-agent-kit/core@broken.version
```

2. **Or deprecate** (for versions older than 72 hours):

```bash
npm deprecate @webflow-agent-kit/core@broken.version "Broken — use latest instead"
```

3. Publish a fixed version with the next patch number.

Never re-publish the same version number — npm rejects duplicates.
