# webflow-agent-kit-python

Python bindings for webflow-agent-kit — use Webflow's Data API from any Python AI agent framework (OpenAI Agents SDK, LangChain Python, CrewAI, etc.).

## Architecture

This package wraps the webflow-agent-kit TypeScript tools via HTTP, providing a Python-native interface. The TypeScript MCP server runs as a subprocess, and this Python package communicates with it via the MCP protocol.

```python
from webflow_agent_kit import WebflowAgentKit

kit = WebflowAgentKit.from_env()
tools = kit.all_tools()

# Use with OpenAI Agents SDK
from agents import Agent, Runner

agent = Agent(
    name="Webflow SEO Bot",
    instructions="Audit Webflow site pages and update SEO metadata.",
    tools=tools.to_openai_sdk(),
)

result = await Runner.run(agent, "Audit site ID abc123")
```

## Installation

```bash
pip install webflow-agent-kit
npm install @webflow-agent-kit/mcp  # Python package uses MCP under the hood
```

## Usage

```python
import os
from webflow_agent_kit import WebflowAgentKit

# Auto-reads WEBFLOW_TOKEN from env
kit = WebflowAgentKit.from_env()

# All 62 tools
tools = kit.all_tools()

# Specific groups
cms_tools = kit.tools(["cms", "sites"])

# Convert to OpenAI Agents SDK format
openai_tools = tools.to_openai_sdk()

# Convert to LangChain format
langchain_tools = tools.to_langchain()

# Convert to CrewAI format
crewai_tools = tools.to_crewai()
```

## Auth

```python
# Env var (recommended)
kit = WebflowAgentKit.from_env()

# Site token
kit = WebflowAgentKit(site_token="your-token")

# OAuth
kit = WebflowAgentKit(access_token="your-oauth-token")
```

## Repo

This is the Python companion to [webflow-agent-kit](https://github.com/anilandcode/webflow-agent-kit).
