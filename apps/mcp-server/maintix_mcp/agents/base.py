from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

class AgentBase(ABC):
    name: str
    description: str

    @abstractmethod
    async def act(self, payload: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError
