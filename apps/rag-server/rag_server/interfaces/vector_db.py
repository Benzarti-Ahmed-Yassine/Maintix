from abc import ABC, abstractmethod
from typing import Any

class VectorDatabase(ABC):

    @abstractmethod
    async def upsert(self, vectors: list[dict[str, Any]]) -> None:
        pass

    @abstractmethod
    async def query(self, embedding: list[float], top_k: int = 10) -> list[dict[str, Any]]:
        pass
