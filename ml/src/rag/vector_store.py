"""
MAINTIX Vector Store & Knowledge Index
======================================
Stores document chunks with dense vector embeddings and metadata.
Provides fast cosine similarity retrieval with metadata filtering.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

from ml.src.rag.document_processor import RAGChunk

logger = logging.getLogger("maintix.vector_store")

REPO_ROOT = Path(__file__).resolve().parents[3]
VECTOR_DIR = REPO_ROOT / "ml" / "data" / "gold" / "rag"
VECTOR_FILE = VECTOR_DIR / "vector_store.json"


class VectorStore:
    """Zero-dependency, persistent vector index for industrial documentation chunks."""

    def __init__(self, persist_path: Path = VECTOR_FILE):
        self.persist_path = persist_path
        self.persist_path.parent.mkdir(parents=True, exist_ok=True)
        self.chunks: List[RAGChunk] = []
        self.embeddings: np.ndarray = np.empty((0, 384))
        self.load()

    def add_chunks(self, chunks: List[RAGChunk], embeddings: List[List[float]]) -> None:
        """Adds embedded chunks to vector database."""
        for c, emb in zip(chunks, embeddings):
            c.embedding = emb
            self.chunks.append(c)

        new_mat = np.array(embeddings, dtype=np.float32)
        if len(self.embeddings) == 0:
            self.embeddings = new_mat
        else:
            self.embeddings = np.vstack([self.embeddings, new_mat])

        self.save()
        logger.info(f"VectorStore now holds {len(self.chunks)} chunks.")

    def search_dense(
        self,
        query_vector: List[float],
        top_k: int = 5,
        category_filter: Optional[str] = None,
        only_validated: bool = True,
    ) -> List[Tuple[RAGChunk, float]]:
        """Cosine similarity dense search with metadata filtering."""
        if len(self.chunks) == 0 or len(self.embeddings) == 0:
            return []

        q_vec = np.array(query_vector, dtype=np.float32)
        q_norm = np.linalg.norm(q_vec)
        if q_norm > 0:
            q_vec /= q_norm

        # Compute cosine similarity
        scores = np.dot(self.embeddings, q_vec)

        results = []
        for idx, score in enumerate(scores):
            chunk = self.chunks[idx]
            if only_validated and chunk.validation_status != "VALIDATED":
                continue
            if category_filter and category_filter != "ALL" and chunk.category != category_filter:
                continue
            results.append((chunk, float(score)))

        # Sort descending
        results.sort(key=lambda x: x[1], reverse=True)
        return results[:top_k]

    def save(self) -> None:
        data = {
            "chunks": [
                {
                    "chunk_id": c.chunk_id,
                    "doc_id": c.doc_id,
                    "title": c.title,
                    "machine_id": c.machine_id,
                    "machine_type": c.machine_type,
                    "component_id": c.component_id,
                    "component_type": c.component_type,
                    "category": c.category,
                    "section": c.section,
                    "page": c.page,
                    "version": c.version,
                    "timestamp": c.timestamp,
                    "validation_status": c.validation_status,
                    "text": c.text,
                    "embedding": c.embedding,
                }
                for c in self.chunks
            ]
        }
        with open(self.persist_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def load(self) -> None:
        if self.persist_path.exists():
            try:
                with open(self.persist_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                loaded_chunks = []
                loaded_vecs = []
                for item in data.get("chunks", []):
                    c = RAGChunk(**item)
                    loaded_chunks.append(c)
                    if c.embedding:
                        loaded_vecs.append(c.embedding)

                self.chunks = loaded_chunks
                if loaded_vecs:
                    self.embeddings = np.array(loaded_vecs, dtype=np.float32)
                logger.info(f"Loaded {len(self.chunks)} chunks from {self.persist_path}")
            except Exception as e:
                logger.error(f"Error loading vector store: {e}")
