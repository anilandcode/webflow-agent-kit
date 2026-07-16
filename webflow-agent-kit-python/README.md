# webflow-agent-kit-python — EXPERIMENTAL / PRE-ALPHA

> **Warning:** This package is a scaffold. No adapter is functional.
> For production use, install the TypeScript packages:
>
> ```bash
> npm install @webflow-agent-kit/core @webflow-agent-kit/vercel-ai
> ```

Python companion package for [webflow-agent-kit](https://github.com/anilandcode/webflow-agent-kit).

## Status

This package is in **pre-alpha** development. All adapter methods raise `NotImplementedError` with guidance to use the TypeScript packages instead.

| Feature | Status |
|---|---|
| `WebflowAgentKit.from_env()` | Works (validates token presence) |
| `kit.all_tools()` | Not implemented |
| `to_openai_sdk()` | Not implemented |
| `to_langchain()` | Not implemented |
| `to_crewai()` | Not implemented |
| `__len__()` | Not implemented |

## Installation (for development)

```bash
cd webflow-agent-kit-python
python -m pip install -e '.[dev]'
```

## Quality Tools

```bash
ruff check .          # Linting
mypy webflow_agent_kit  # Type checking
pytest                # Tests
python -m build       # Package build
python -m twine check dist/*  # Distribution validation
```

## Architecture (proposed)

The TypeScript MCP server (`@webflow-agent-kit/mcp`) will run as a subprocess, and this Python package will communicate with it via the MCP protocol over stdio. The transport layer is not yet implemented.

## Roadmap

See [docs/python-status.md](docs/python-status.md) for detailed limitations and architecture options.

## Repo

[github.com/anilandcode/webflow-agent-kit](https://github.com/anilandcode/webflow-agent-kit)
