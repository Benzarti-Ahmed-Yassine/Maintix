from abc import ABC, abstractmethod
from typing import Any

class EmbeddingProvider(ABC):

    @abstractmethod
    async def embed(self, texts: list[str]) -> list[list[float]]:
        pass
