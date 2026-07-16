"""webflow-agent-kit Python bindings.

Exposes all 62 Webflow Data API tools as Python-native callables,
compatible with OpenAI Agents SDK, LangChain Python, CrewAI, and any MCP client.
"""

from .client import WebflowAgentKit
from .tools import ToolSet

__version__ = "0.0.1"
__all__ = ["WebflowAgentKit", "ToolSet"]
