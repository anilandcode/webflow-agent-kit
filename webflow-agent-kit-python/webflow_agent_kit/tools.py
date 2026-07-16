"""ToolSet for converting webflow-agent-kit tools to Python framework formats."""

from dataclasses import dataclass, field
from typing import Any, Optional


@dataclass
class ToolSet:
    all_groups: bool = False
    groups: Optional[list[str]] = field(default_factory=list)

    def to_openai_sdk(self) -> list[dict[str, Any]]:
        """Convert to OpenAI Agents SDK function tool format."""
        return [{"type": "function", "name": "webflow_*", "description": "...", "parameters": {}}]

    def to_langchain(self) -> list[Any]:
        """Convert to LangChain tool format."""
        return []

    def to_crewai(self) -> list[Any]:
        """Convert to CrewAI tool format."""
        return []

    def __len__(self) -> int:
        return 62
