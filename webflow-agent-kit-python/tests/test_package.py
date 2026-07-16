"""Tests for webflow-agent-kit-python — EXPERIMENTAL package."""
import pytest


def test_import():
    """Package imports without error."""
    import webflow_agent_kit

    assert webflow_agent_kit.__version__ == "0.0.1"


def test_from_env_requires_token(monkeypatch):
    """Missing WEBFLOW_TOKEN raises a clear error."""
    from webflow_agent_kit import WebflowAgentKit

    monkeypatch.delenv("WEBFLOW_TOKEN", raising=False)
    with pytest.raises(ValueError, match="WEBFLOW_TOKEN"):
        WebflowAgentKit.from_env()


def test_from_env_with_token(monkeypatch):
    """WEBFLOW_TOKEN present returns a WebflowAgentKit instance."""
    from webflow_agent_kit import WebflowAgentKit

    monkeypatch.setenv("WEBFLOW_TOKEN", "test-token")
    kit = WebflowAgentKit.from_env()
    assert kit.site_token == "test-token"


def test_all_tools_raises():
    """all_tools() raises NotImplementedError with guidance."""
    from webflow_agent_kit import WebflowAgentKit

    kit = WebflowAgentKit(site_token="test")
    with pytest.raises(NotImplementedError, match="TypeScript packages"):
        kit.all_tools()


def test_tools_raises():
    """tools() raises NotImplementedError with guidance."""
    from webflow_agent_kit import WebflowAgentKit

    kit = WebflowAgentKit(site_token="test")
    with pytest.raises(NotImplementedError, match="TypeScript packages"):
        kit.tools(["cms"])


def test_to_openai_sdk_raises():
    """to_openai_sdk raises NotImplementedError with guidance."""
    from webflow_agent_kit import ToolSet

    ts = ToolSet(all_groups=True)
    with pytest.raises(NotImplementedError, match="TypeScript packages"):
        ts.to_openai_sdk()


def test_to_langchain_raises():
    """to_langchain raises NotImplementedError with guidance."""
    from webflow_agent_kit import ToolSet

    ts = ToolSet(all_groups=True)
    with pytest.raises(NotImplementedError, match="TypeScript"):
        ts.to_langchain()


def test_to_crewai_raises():
    """to_crewai raises NotImplementedError."""
    from webflow_agent_kit import ToolSet

    ts = ToolSet(all_groups=True)
    with pytest.raises(NotImplementedError, match="CrewAI"):
        ts.to_crewai()


def test_len_raises():
    """__len__ raises NotImplementedError."""
    from webflow_agent_kit import ToolSet

    ts = ToolSet(all_groups=True)
    with pytest.raises(NotImplementedError, match="tool registry"):
        len(ts)


def test_explicit_token_constructor():
    """Explicit token constructor works."""
    from webflow_agent_kit import WebflowAgentKit

    kit = WebflowAgentKit(site_token="explicit")
    assert kit.site_token == "explicit"
    assert kit.access_token is None


def test_oauth_constructor():
    """OAuth token constructor works."""
    from webflow_agent_kit import WebflowAgentKit

    kit = WebflowAgentKit(access_token="oauth-token")
    assert kit.access_token == "oauth-token"
    assert kit.site_token is None
