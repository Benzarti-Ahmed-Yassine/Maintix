from __future__ import annotations

from typing import Any
from maintix_mcp.core.memory import ConversationMemory

class ContextManager:
    def __init__(self, window: int = 50) -> None:
        self.memory = ConversationMemory(window=window)

    def add_context(self, agent: str, query: str, response: str, metadata: dict[str, Any] | None = None) -> None:
        self.memory.add({'agent': agent, 'query': query, 'response': response, 'metadata': metadata or {}})

    def list_context(self) -> list[dict[str, Any]]:
        return self.memory.list()

    def find_agent_context(self, agent: str) -> list[dict[str, Any]]:
        return self.memory.find_by_agent(agent)

    def clear(self) -> None:
        self.memory.clear()
