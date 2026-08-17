"""
MAINTIX Graph + Vector Hybrid Fusion Retriever
===============================================
Combines relational Knowledge Graph traversal with semantic Vector RAG chunks.
Context Fusion Pipeline:
1. Detect entities (Machine, Component, Sensor, Alarm, Part)
2. Traversal: Retrieve graph connections (Fault -> Procedure -> Spares -> Orders)
3. Vector search: Retrieve relevant document text passages & standards
4. Context Fusion: Synthesizes fully-grounded industrial context
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from ml.src.graph.graph_retriever import GraphRetriever
from ml.src.graph.knowledge_graph import IndustrialKnowledgeGraph
from ml.src.rag.embeddings import DenseEmbedder
from ml.src.rag.retriever import HybridRAGRetriever
from ml.src.rag.vector_store import VectorStore

logger = logging.getLogger("maintix.hybrid_retriever")


class GraphVectorHybridEngine:
    """Unified Graph RAG + Vector RAG fusion retriever."""

    def __init__(
        self,
        graph_retriever: Optional[GraphRetriever] = None,
        rag_retriever: Optional[HybridRAGRetriever] = None,
    ):
        if graph_retriever is None:
            kg = IndustrialKnowledgeGraph()
            self.graph_retriever = GraphRetriever(kg)
        else:
            self.graph_retriever = graph_retriever

        if rag_retriever is None:
            vs = VectorStore()
            embedder = DenseEmbedder()
            self.rag_retriever = HybridRAGRetriever(vs, embedder)
        else:
            self.rag_retriever = rag_retriever

    def query(
        self,
        query_text: str,
        role: str = "TECHNICIAN",
        machine_code: str = "TX-1250-A",
        live_telemetry: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Executes unified hybrid retrieval:
        1. Graph Context: entity relationships, procedures, spares, production impact
        2. Vector Context: manual excerpts, ISO standards, guidelines
        3. Telemetry Grounding: live sensor values and RUL
        """
        # 1. Graph Retrieval
        graph_context = self.graph_retriever.retrieve_subgraph(f"{query_text} {machine_code}")

        # 2. Vector Retrieval
        doc_chunks = self.rag_retriever.retrieve(query_text, top_k=3)

        # 3. Format citations and sources
        sources = []
        for c in doc_chunks:
            sources.append({
                "type": "DOCUMENTATION",
                "id": c["chunk_id"],
                "title": c["title"],
                "snippet": c["text"][:180] + ("..." if len(c["text"]) > 180 else ""),
            })

        for node in graph_context["nodes"][:4]:
            sources.append({
                "type": "GRAPH_ENTITY",
                "id": node["id"],
                "title": f"Knowledge Graph Entity ({node.get('node_type', 'Entity')})",
                "snippet": f"Node: {node['id']} ({node.get('name', '')})",
            })

        return {
            "query": query_text,
            "role": role,
            "machine_code": machine_code,
            "graph_summary": graph_context["formatted_summary"],
            "graph_nodes": graph_context["nodes"],
            "graph_edges": graph_context["edges"],
            "document_chunks": doc_chunks,
            "sources": sources,
        }
