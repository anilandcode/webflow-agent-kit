"""WebflowAgentKit client — EXPERIMENTAL. No MCP transport is implemented."""

from dataclasses import dataclass
from typing import Optional

from .tools import ToolSet


@dataclass
class WebflowAgentKit:
    """EXPERIMENTAL: Entry point for webflow-agent-kit Python bindings.

    The TypeScript packages are the supported path:
        npm install @webflow-agent-kit/core @webflow-agent-kit/vercel-ai

    This Python package is a pre-alpha scaffold. Tool retrieval and
    framework adapters are not implemented.
    """

    site_token: Optional[str] = None
    access_token: Optional[str] = None

    @classmethod
    def from_env(cls) -> "WebflowAgentKit":
        """Read WEBFLOW_TOKEN from environment variable."""
        import os

        token = os.environ.get("WEBFLOW_TOKEN")
        if not token:
            raise ValueError("WEBFLOW_TOKEN environment variable not set")
        return cls(site_token=token)

    def all_tools(self) -> ToolSet:
        """Return all 62 tools.

        Raises:
            NotImplementedError: Tool retrieval requires an MCP transport
                that has not been implemented. Use the TypeScript packages
                for production: @webflow-agent-kit/core
        """
        raise NotImplementedError(
            "Tool retrieval is not implemented. "
            "The Python package requires an MCP transport layer that has not been built. "
            "Use the TypeScript packages for production: npm install @webflow-agent-kit/core"
        )

    def tools(self, groups: list[str]) -> ToolSet:
        """Return tools for specific groups (e.g., ['cms', 'sites']).

        Raises:
            NotImplementedError: Tool retrieval requires an MCP transport
                that has not been implemented.
        """
        raise NotImplementedError(
            "Tool retrieval is not implemented. "
            "Use the TypeScript packages: @webflow-agent-kit/core"
        )
