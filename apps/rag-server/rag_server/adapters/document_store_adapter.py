from typing import Any

class DocumentStoreAdapter:
    async def ingest(self, documents: list[dict[str, Any]]) -> None:
        pass

    async def search(self, query: str) -> list[dict[str, Any]]:
        return []
