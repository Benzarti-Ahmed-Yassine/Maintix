from abc import ABC, abstractmethod
from typing import Any

class DocumentStore(ABC):

    @abstractmethod
    async def ingest(self, documents: list[dict[str, Any]]) -> None:
        pass

    @abstractmethod
    async def list_documents(self, query: str) -> list[dict[str, Any]]:
        pass
