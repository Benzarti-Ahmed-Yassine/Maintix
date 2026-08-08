from typing import Any
import numpy as np

class FaissSimulator:
    def __init__(self, dimension: int) -> None:
        self.dimension = dimension
        self.vectors: list[np.ndarray] = []
        self.metadatas: list[dict[str, Any]] = []

    def add(self, embeddings: list[list[float]], metadatas: list[dict[str, Any]]) -> None:
        for embedding, meta in zip(embeddings, metadatas):
            self.vectors.append(np.array(embedding, dtype=float))
            self.metadatas.append(meta)

    def query(self, embedding: list[float], top_k: int = 5) -> list[dict[str, Any]]:
        if not self.vectors:
            return []
        target = np.array(embedding, dtype=float)
        scores = [float(np.dot(vec, target) / (np.linalg.norm(vec) * np.linalg.norm(target) + 1e-6)) for vec in self.vectors]
        ranked = sorted(enumerate(scores), key=lambda item: item[1], reverse=True)[:top_k]
        return [dict(self.metadatas[idx], score=score) for idx, score in ranked]
