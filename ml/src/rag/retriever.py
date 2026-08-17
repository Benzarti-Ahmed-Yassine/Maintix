"""
MAINTIX Hybrid RAG Retriever
============================
Performs hybrid lexical (BM25) and dense semantic vector retrieval.
Combines results using Reciprocal Rank Fusion (RRF).
Grounds queries in live machine telemetry and user role context.
"""

from __future__ import annotations

import logging
import math
import re
from typing import Any, Dict, List, Optional, Tuple

from ml.src.rag.document_processor import DocumentProcessor, RAGChunk
from ml.src.rag.embeddings import DenseEmbedder
from ml.src.rag.vector_store import VectorStore

logger = logging.getLogger("maintix.retriever")


class HybridRAGRetriever:
    """Hybrid retrieval engine combining BM25 exact keyword matching and dense vector search."""

    def __init__(self, vector_store: VectorStore, embedder: DenseEmbedder):
        self.vector_store = vector_store
        self.embedder = embedder
        self._build_lexical_index()

    def _build_lexical_index(self):
        self.doc_freq = {}
        self.chunk_tokens = {}
        for c in self.vector_store.chunks:
            tokens = set(self._tokenize(c.text))
            self.chunk_tokens[c.chunk_id] = tokens
            for t in tokens:
                self.doc_freq[t] = self.doc_freq.get(t, 0) + 1

    def _tokenize(self, text: str) -> List[str]:
        return [t.lower() for t in re.findall(r'[A-Za-z0-9_\-\.]+', text) if len(t) > 1]

    def _search_bm25(self, query: str, top_k: int = 10) -> List[Tuple[RAGChunk, float]]:
        q_tokens = self._tokenize(query)
        if not q_tokens or not self.vector_store.chunks:
            return []

        N = len(self.vector_store.chunks)
        scores = []
        for chunk in self.vector_store.chunks:
            if chunk.validation_status != "VALIDATED":
                continue
            score = 0.0
            tokens = self.chunk_tokens.get(chunk.chunk_id, set())
            for t in q_tokens:
                if t in tokens:
                    df = self.doc_freq.get(t, 1)
                    idf = math.log(1.0 + (N - df + 0.5) / (df + 0.5))
                    score += idf
            if score > 0:
                scores.append((chunk, score))

        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]

    def retrieve(
        self,
        query: str,
        top_k: int = 4,
        category: Optional[str] = None,
        rrf_k: int = 60,
    ) -> List[Dict[str, Any]]:
        """
        Hybrid retrieval using Reciprocal Rank Fusion (RRF).
        RRF_Score(d) = 1/(k + rank_bm25(d)) + 1/(k + rank_dense(d))
        """
        # 1. Lexical BM25
        bm25_results = self._search_bm25(query, top_k=top_k * 2)

        # 2. Dense Vector
        q_emb = self.embedder.embed_query(query)
        dense_results = self.vector_store.search_dense(q_emb, top_k=top_k * 2, category_filter=category)

        # 3. Reciprocal Rank Fusion
        rrf_scores: Dict[str, float] = {}
        chunk_map: Dict[str, RAGChunk] = {}

        for rank, (chunk, _) in enumerate(bm25_results):
            cid = chunk.chunk_id
            chunk_map[cid] = chunk
            rrf_scores[cid] = rrf_scores.get(cid, 0.0) + (1.0 / (rrf_k + rank + 1))

        for rank, (chunk, _) in enumerate(dense_results):
            cid = chunk.chunk_id
            chunk_map[cid] = chunk
            rrf_scores[cid] = rrf_scores.get(cid, 0.0) + (1.0 / (rrf_k + rank + 1))

        sorted_cids = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)[:top_k]

        formatted = []
        for cid, score in sorted_cids:
            chunk = chunk_map[cid]
            formatted.append({
                "chunk_id": chunk.chunk_id,
                "doc_id": chunk.doc_id,
                "title": f"{chunk.title} — {chunk.section}",
                "category": chunk.category,
                "text": chunk.text,
                "score": round(score * 100.0, 3),
                "validation_status": chunk.validation_status,
            })

        return formatted
