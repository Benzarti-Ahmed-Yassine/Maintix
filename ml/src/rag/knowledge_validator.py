"""
MAINTIX Knowledge Validation Engine
===================================
Enforces the industrial safety principle:
Only VALIDATED content may enter the trusted RAG / Copilot knowledge layer.
Unverified documents remain PENDING until reviewed by a qualified engineer.
"""

from __future__ import annotations

import logging
from typing import Dict, Any, List

from ml.src.rag.vector_store import VectorStore

logger = logging.getLogger("maintix.knowledge_validator")


class KnowledgeValidator:
    """Manages document chunk validation state transitions."""

    def __init__(self, vector_store: VectorStore):
        self.vector_store = vector_store

    def validate_chunk(self, chunk_id: str, reviewer: str = "Lead Reliability Engineer") -> bool:
        for c in self.vector_store.chunks:
            if c.chunk_id == chunk_id:
                c.validation_status = "VALIDATED"
                c.metadata["reviewed_by"] = reviewer
                self.vector_store.save()
                logger.info(f"Chunk {chunk_id} marked as VALIDATED by {reviewer}")
                return True
        return False

    def reject_chunk(self, chunk_id: str, reason: str) -> bool:
        for c in self.vector_store.chunks:
            if c.chunk_id == chunk_id:
                c.validation_status = "REJECTED"
                c.metadata["rejection_reason"] = reason
                self.vector_store.save()
                logger.info(f"Chunk {chunk_id} REJECTED: {reason}")
                return True
        return False
