"""
MAINTIX Graph Retriever
=======================
Extracts entities from user queries and traverses the Knowledge Graph to return
structured relational contexts (e.g. Machine -> Component -> Sensor -> Fault -> Procedure -> Spares).
"""

from __future__ import annotations

import logging
import re
from typing import Any, Dict, List, Set

from ml.src.graph.knowledge_graph import IndustrialKnowledgeGraph

logger = logging.getLogger("maintix.graph_retriever")


class GraphRetriever:
    """Performs entity extraction and multi-hop graph context retrieval."""

    def __init__(self, graph: IndustrialKnowledgeGraph):
        self.kg = graph

    def detect_entities(self, query: str) -> List[str]:
        """Detects machine codes, part numbers, and component tokens in query."""
        detected = []
        q_upper = query.upper()

        for node in self.kg.graph.nodes():
            if node.upper() in q_upper:
                detected.append(node)

        # Keyword heuristics for common entities
        if "BEARING" in q_upper or "VIBRATION" in q_upper:
            detected.append("COMP-BRG-LEFT")
            detected.append("SENS-VIB-03")
        if "MOTOR" in q_upper:
            detected.append("COMP-MOTOR-01")
        if "GEARBOX" in q_upper:
            detected.append("COMP-GBX-01")
        if "TX-1250" in q_upper or "LOOM" in q_upper:
            detected.append("TX-1250-A")
        if "PCL-GMX" in q_upper:
            detected.append("PCL-GMX-001")

        return list(dict.fromkeys(detected))

    def retrieve_subgraph(self, query: str, max_hops: int = 2) -> Dict[str, Any]:
        """Returns structured multi-hop relational context for detected entities."""
        entities = self.detect_entities(query)
        if not entities:
            # Default to primary monitored machine
            entities = ["TX-1250-A"]

        all_nodes = {}
        all_edges = []

        for entity in entities:
            sub = self.kg.get_neighbors(entity, max_hops=max_hops)
            for n in sub["nodes"]:
                all_nodes[n["id"]] = n
            all_edges.extend(sub["edges"])

        # Deduplicate edges
        unique_edges = []
        seen = set()
        for e in all_edges:
            edge_key = (e["source"], e["target"], e["relation"])
            if edge_key not in seen:
                seen.add(edge_key)
                unique_edges.append(e)

        return {
            "query": query,
            "detected_entities": entities,
            "nodes": list(all_nodes.values()),
            "edges": unique_edges,
            "formatted_summary": self._format_graph_text(all_nodes, unique_edges),
        }

    def _format_graph_text(self, nodes: Dict[str, Any], edges: List[Dict[str, Any]]) -> str:
        """Converts graph relationships into human/LLM-readable structural context."""
        lines = ["[GRAPH RELATIONSHIPS]"]
        for e in edges[:12]:
            src_name = nodes.get(e["source"], {}).get("name", e["source"])
            tgt_name = nodes.get(e["target"], {}).get("name", e["target"])
            lines.append(f"  • ({e['source']}: {src_name}) —[{e['relation']}]—> ({e['target']}: {tgt_name})")
        return "\n".join(lines)
