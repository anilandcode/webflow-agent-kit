"""ToolSet — EXPERIMENTAL. All adapters raise NotImplementedError.

The TypeScript packages are the supported path for production use.
See docs/python-status.md for the Python implementation roadmap.
"""

from dataclasses import dataclass, field
from typing import Any, Optional


@dataclass
class ToolSet:
    """EXPERIMENTAL: Placeholder tool collection.

    All conversion methods raise NotImplementedError because the
    MCP transport layer has not been implemented. Use the TypeScript
    packages for production: @webflow-agent-kit/vercel-ai, @webflow-agent-kit/langchain.
    """

    all_groups: bool = False
    groups: Optional[list[str]] = field(default_factory=list)

    def to_openai_sdk(self) -> list[dict[str, Any]]:
        """Convert to OpenAI Agents SDK function tool format.

        Raises:
            NotImplementedError: The OpenAI adapter is not implemented.
                Use @webflow-agent-kit/core with the Vercel AI SDK in TypeScript
                as the supported path.
        """
        raise NotImplementedError(
            "to_openai_sdk is not implemented. "
            "The OpenAI Agents SDK adapter requires the MCP transport layer. "
            "Use the TypeScript packages: @webflow-agent-kit/core"
        )

    def to_langchain(self) -> list[Any]:
        """Convert to LangChain tool format.

        Raises:
            NotImplementedError: The LangChain adapter is not implemented.
                Use @webflow-agent-kit/langchain in TypeScript.
        """
        raise NotImplementedError(
            "to_langchain is not implemented. "
            "Use @webflow-agent-kit/langchain in TypeScript."
        )

    def to_crewai(self) -> list[Any]:
        """Convert to CrewAI tool format.

        Raises:
            NotImplementedError: The CrewAI adapter is not implemented.
        """
        raise NotImplementedError(
            "to_crewai is not implemented. "
            "No CrewAI adapter exists in TypeScript or Python."
        )

    def __len__(self) -> int:
        """Raise NotImplementedError — tool count requires a real registry.

        Raises:
            NotImplementedError: Tool count requires a real tool registry
                that has not been built.
        """
        raise NotImplementedError(
            "__len__ requires a real tool registry. "
            "Once the MCP transport is implemented, the count will be computed "
            "from the actual tool set. Until then, use the TypeScript packages."
        )
