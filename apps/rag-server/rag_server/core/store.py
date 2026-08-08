from __future__ import annotations

from typing import Any
import math

class MemoryDocumentStore:
    _documents: list[dict[str, Any]] = []

    @classmethod
    async def ingest(cls, documents: list[dict[str, Any]]) -> None:
        cls._documents.extend(documents)

    @classmethod
    async def list_documents(cls, query: str | None = None) -> list[dict[str, Any]]:
        if not query:
            return cls._documents.copy()

        lower = query.lower()
        return [doc for doc in cls._documents if lower in str(doc.get('content', '')).lower()]

    @classmethod
    async def clear(cls) -> None:
        cls._documents = []

class InMemoryVectorIndex:
    def __init__(self, dimension: int) -> None:
        self.dimension = dimension
        self.embeddings: list[list[float]] = []
        self.metadatas: list[dict[str, Any]] = []
        self.contents: list[str] = []

    def _cosine_similarity(self, a: list[float], b: list[float]) -> float:
        dot = sum(x * y for x, y in zip(a, b))
        mag_a = math.sqrt(sum(x * x for x in a))
        mag_b = math.sqrt(sum(y * y for y in b))
        if mag_a == 0 or mag_b == 0:
            return 0.0
        return dot / (mag_a * mag_b)

    async def add(self, embeddings: list[list[float]], metadatas: list[dict[str, Any]], contents: list[str]) -> None:
        for embedding, metadata, content in zip(embeddings, metadatas, contents):
            self.embeddings.append(embedding)
            self.metadatas.append(metadata)
            self.contents.append(content)

    async def query(self, embedding: list[float], top_k: int = 5) -> list[dict[str, Any]]:
        if not self.embeddings:
            return []
        scores = [self._cosine_similarity(embedding, stored) for stored in self.embeddings]
        ranked = sorted(enumerate(scores), key=lambda item: item[1], reverse=True)[:top_k]
        return [
            {
                'metadata': self.metadatas[index],
                'content': self.contents[index],
                'score': score,
            }
            for index, score in ranked
        ]

class MemoryVectorStore:
    _index: InMemoryVectorIndex | None = None

    @classmethod
    async def initialize(cls, dimension: int) -> None:
        if cls._index is None:
            cls._index = InMemoryVectorIndex(dimension)

    @classmethod
    async def upsert(cls, embeddings: list[list[float]], metadatas: list[dict[str, Any]], contents: list[str]) -> None:
        if cls._index is None:
            raise RuntimeError('Vector store not initialized')
        await cls._index.add(embeddings, metadatas, contents)

    @classmethod
    async def query(cls, embedding: list[float], top_k: int = 5) -> list[dict[str, Any]]:
        if cls._index is None:
            return []
        return await cls._index.query(embedding, top_k)

    @classmethod
    async def clear(cls) -> None:
        cls._index = None
