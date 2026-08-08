from abc import ABC, abstractmethod
from typing import Any

class Chunker(ABC):

    @abstractmethod
    async def chunk(self, document: dict[str, Any]) -> list[dict[str, Any]]:
        pass
