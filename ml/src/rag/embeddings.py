"""
MAINTIX Dense Embedding Engine
==============================
Generates dense vector representations using sentence-transformers (local all-MiniLM-L6-v2).
Provides fallback embedding generator if torch/transformers are not available.
"""

from __future__ import annotations

import logging
from typing import List, Union

import numpy as np

logger = logging.getLogger("maintix.embeddings")

try:
    from sentence_transformers import SentenceTransformer
    HAS_SENTENCE_TRANSFORMERS = True
except ImportError:
    HAS_SENTENCE_TRANSFORMERS = False


class DenseEmbedder:
    """Generates 384-dimensional dense semantic vectors."""

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model = None
        if HAS_SENTENCE_TRANSFORMERS:
            try:
                self.model = SentenceTransformer(model_name)
                logger.info(f"Loaded sentence-transformers model: {model_name}")
            except Exception as e:
                logger.warning(f"Could not load local sentence-transformers model: {e}")

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Encodes list of strings to list of float vectors."""
        if not texts:
            return []

        if self.model is not None:
            embeddings = self.model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
            return embeddings.tolist()

        # Deterministic lightweight hashing fallback for fast CPU testing
        fallback_vecs = []
        for text in texts:
            vec = np.zeros(384, dtype=np.float32)
            for idx, word in enumerate(text.lower().split()[:50]):
                h = abs(hash(word)) % 384
                vec[h] += 1.0 / (idx + 1)
            norm = np.linalg.norm(vec)
            if norm > 0:
                vec /= norm
            fallback_vecs.append(vec.tolist())
        return fallback_vecs

    def embed_query(self, query: str) -> List[float]:
        return self.embed_texts([query])[0]
