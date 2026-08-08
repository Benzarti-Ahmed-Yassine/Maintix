from __future__ import annotations

from typing import Any
from rag_server.core.config import RagConfig

class ToolRegistry:
    def __init__(self) -> None:
        self.tools: dict[str, dict[str, Any]] = {}

    def register(self, tool: str, description: str, inputs: dict[str, str]) -> None:
        self.tools[tool] = {'description': description, 'inputs': inputs}

    def list(self) -> dict[str, dict[str, Any]]:
        return self.tools.copy()

    def get(self, tool: str) -> dict[str, Any] | None:
        return self.tools.get(tool)
