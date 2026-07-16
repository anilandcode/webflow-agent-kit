"""WebflowAgentKit client — connects to the MCP server backend."""

from dataclasses import dataclass
from typing import Optional
from .tools import ToolSet


@dataclass
class WebflowAgentKit:
    """Main entry point for webflow-agent-kit Python bindings.

    Communicates with the @webflow-agent-kit/mcp server under the hood.
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
        """Return all 62 tools."""
        return ToolSet(all_groups=True)

    def tools(self, groups: list[str]) -> ToolSet:
        """Return tools for specific groups (e.g., ['cms', 'sites'])."""
        return ToolSet(groups=groups)
