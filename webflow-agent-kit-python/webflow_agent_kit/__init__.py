"""webflow-agent-kit Python bindings — EXPERIMENTAL / PRE-ALPHA.

WARNING: This package is a scaffold. No adapter is implemented.
Use the TypeScript packages for production:

    npm install @webflow-agent-kit/core @webflow-agent-kit/vercel-ai

See docs/python-status.md for the Python roadmap.
"""

from .client import WebflowAgentKit
from .tools import ToolSet

__version__ = "0.0.1"
__all__ = ["WebflowAgentKit", "ToolSet"]
