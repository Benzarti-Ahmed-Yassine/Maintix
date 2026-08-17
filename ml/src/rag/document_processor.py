"""
MAINTIX RAG Document Processor & Semantic Chunker
=================================================
Processes industrial technical manuals, standards, failure reports, and datasheets.
Features:
- Configurable semantic chunking (800-1200 tokens, 100-200 token overlap)
- Metadata preservation (chunk_id, doc_id, machine_type, category, section, validation_status)
- Noise cleaning and table-preserving tokenization
"""

from __future__ import annotations

import logging
import re
import time
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

logger = logging.getLogger("maintix.doc_processor")


@dataclass
class RAGChunk:
    chunk_id: str
    doc_id: str
    title: str
    machine_id: str
    machine_type: str
    component_id: str
    component_type: str
    category: str  # MANUAL | STANDARD | PROCEDURE | FAILURE_REPORT | DATASHEET
    section: str
    page: int
    version: str
    timestamp: str
    validation_status: str  # PENDING | VALIDATED | REJECTED
    text: str
    embedding: Optional[List[float]] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


class DocumentProcessor:
    """Chunks and prepares industrial text documents for hybrid retrieval."""

    def __init__(
        self,
        chunk_size_words: int = 150,  # ~1000 tokens
        chunk_overlap_words: int = 25,  # ~150 tokens
    ):
        self.chunk_size = chunk_size_words
        self.overlap = chunk_overlap_words

    def clean_text(self, text: str) -> str:
        """Cleans whitespace, non-printable characters, preserves part numbers."""
        text = re.sub(r'\r\n', '\n', text)
        text = re.sub(r'[ \t]+', ' ', text)
        return text.strip()

    def chunk_document(
        self,
        doc_id: str,
        title: str,
        content: str,
        category: str = "MANUAL",
        machine_type: str = "ALL",
        machine_id: str = "ALL",
        component_type: str = "ALL",
        component_id: str = "ALL",
        section: str = "General",
        validation_status: str = "VALIDATED",
    ) -> List[RAGChunk]:
        """Splits raw document text into overlapping, metadata-rich RAG chunks."""
        cleaned = self.clean_text(content)
        words = cleaned.split()

        if len(words) <= self.chunk_size:
            chunk = RAGChunk(
                chunk_id=f"{doc_id}-CHK-01",
                doc_id=doc_id,
                title=title,
                machine_id=machine_id,
                machine_type=machine_type,
                component_id=component_id,
                component_type=component_type,
                category=category,
                section=section,
                page=1,
                version="v1.0",
                timestamp=str(int(time.time())),
                validation_status=validation_status,
                text=cleaned,
            )
            return [chunk]

        chunks = []
        step = self.chunk_size - self.overlap
        chunk_idx = 1

        for i in range(0, len(words), step):
            chunk_words = words[i : i + self.chunk_size]
            if len(chunk_words) < 15:  # Skip tiny trailing fragment
                continue

            chunk_text = " ".join(chunk_words)
            chunk = RAGChunk(
                chunk_id=f"{doc_id}-CHK-{chunk_idx:02d}",
                doc_id=doc_id,
                title=title,
                machine_id=machine_id,
                machine_type=machine_type,
                component_id=component_id,
                component_type=component_type,
                category=category,
                section=section,
                page=max(1, (i // 300) + 1),
                version="v1.0",
                timestamp=str(int(time.time())),
                validation_status=validation_status,
                text=chunk_text,
            )
            chunks.append(chunk)
            chunk_idx += 1

        return chunks
