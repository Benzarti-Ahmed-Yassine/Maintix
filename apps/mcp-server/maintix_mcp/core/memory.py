from __future__ import annotations

from typing import Any
from collections import deque

class ConversationMemory:
    def __init__(self, window: int = 50) -> None:
        self.window = window
        self.entries: deque[dict[str, Any]] = deque(maxlen=window)

    def add(self, entry: dict[str, Any]) -> None:
        self.entries.append(entry)

    def list(self) -> list[dict[str, Any]]:
        return list(self.entries)

    def clear(self) -> None:
        self.entries.clear()

    def find_by_agent(self, agent: str) -> list[dict[str, Any]]:
        return [entry for entry in self.entries if entry.get('agent') == agent]
