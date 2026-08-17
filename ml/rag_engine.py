"""
MAINTIX RAG Engine Interface
============================
Integrates Hybrid RAG Retriever with Knowledge Graph and live telemetry.
Preserves existing API interface while delegating to the production RAG/Graph pipeline.
"""

from __future__ import annotations

import logging
import time
from typing import Any, Dict, List, Optional

from ml.src.ai_gateway.gateway import AIGateway
from ml.src.graph.graph_builder import build_default_factory_graph
from ml.src.graph.hybrid_retriever import GraphVectorHybridEngine
from ml.src.rag.document_processor import DocumentProcessor, RAGChunk
from ml.src.rag.embeddings import DenseEmbedder
from ml.src.rag.vector_store import VectorStore

logger = logging.getLogger("maintix.rag_engine")


class ProductionRAGService:
    """Production RAG service wrapper providing role-grounded responses."""

    def __init__(self):
        self.gateway = AIGateway()
        self.vector_store = VectorStore()
        self.processor = DocumentProcessor()
        self.embedder = DenseEmbedder()
        self._ensure_seeded()

    def _ensure_seeded(self):
        """Seeds default corpus if vector store is empty."""
        if len(self.vector_store.chunks) == 0:
            docs = [
                {
                    "doc_id": "DOC-ISO-10816",
                    "title": "ISO 10816-3 Mechanical Vibration Evaluation Standard",
                    "category": "STANDARD",
                    "content": (
                        "Zone A: Newly commissioned machinery (< 1.4 mm/s RMS). "
                        "Zone B: Unrestricted continuous industrial operation (1.4 - 2.8 mm/s RMS). "
                        "Zone C: Warning condition (2.8 - 4.5 mm/s RMS). "
                        "Zone D: Critical danger threshold (> 4.5 mm/s RMS). Immediate trip or shutdown mandatory to prevent shaft fracture or bearing seizure."
                    )
                },
                {
                    "doc_id": "DOC-SKF-6208",
                    "title": "SKF Industrial Deep Groove Ball Bearing 6208 Maintenance Manual",
                    "category": "MANUAL",
                    "content": (
                        "Part Ref: SP-BRG-6208-SKF. Outer Diameter: 80 mm, Bore: 40 mm, Width: 18 mm. "
                        "Lubrication: SKF LGMT 3 mineral oil grease. Replenishment: 15g per cavity at 2,000h intervals. "
                        "Drive shaft radial runout tolerance must not exceed 0.02 mm."
                    )
                },
                {
                    "doc_id": "DOC-PICANOL-1250",
                    "title": "Picanol OptiMax-i 1250 Air-Jet Loom Service Manual",
                    "category": "MANUAL",
                    "content": (
                        "Main Drive Motor: 7.5 kW AC Induction Servo. Nominal Weft Rate: 1,250 PPM. "
                        "When vibration exceeds 4.5 mm/s RMS or temperature exceeds 60°C on Left Main Drive, "
                        "the machine control unit enters throttled mode to prevent shedding motion lockup."
                    )
                }
            ]
            for d in docs:
                chunks = self.processor.chunk_document(
                    doc_id=d["doc_id"],
                    title=d["title"],
                    content=d["content"],
                    category=d["category"],
                )
                embeddings = self.embedder.embed_texts([c.text for c in chunks])
                self.vector_store.add_chunks(chunks, embeddings)

    def query(
        self,
        query_text: str,
        role: str = "TECHNICIAN",
        machine_code: str = "TX-1250-A",
        live_telemetry: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Queries AI Gateway with Hybrid Graph + Vector grounding."""
        return self.gateway.process_query(
            query_text=query_text,
            role=role,
            machine_code=machine_code,
            live_telemetry=live_telemetry,
        )


# Global singleton instance
rag_service = ProductionRAGService()
