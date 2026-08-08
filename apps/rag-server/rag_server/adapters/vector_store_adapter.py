from typing import Any

class VectorStoreAdapter:
    async def upsert(self, vectors: list[dict[str, Any]]) -> None:
        pass

    async def query(self, embedding: list[float], top_k: int = 10) -> list[dict[str, Any]]:
        return []
