"""
MAINTIX Industrial Knowledge Graph
==================================
NetworkX-powered Knowledge Graph explicitly modeling relationships across:
Nodes:
- Machine, MachineModel, Component, Sensor, Reading, Anomaly, Failure,
  MaintenanceEvent, WorkOrder, SparePart, ProductionLine, ProductionOrder,
  Document, Procedure, Technician, Alert, AIRecommendation

Relationships:
- Machine -> HAS_COMPONENT -> Component
- Component -> HAS_SENSOR -> Sensor
- Sensor -> PRODUCES -> Reading
- Reading -> INDICATES -> Anomaly
- Anomaly -> SUGGESTS -> Failure
- Failure -> REQUIRES -> Procedure
- Machine -> HAS_DOCUMENT -> Document
- Machine -> BELONGS_TO -> ProductionLine
- Machine -> CAUSED -> DowntimeEvent
- WorkOrder -> TARGETS -> Machine
- WorkOrder -> USES -> SparePart
- Technician -> PERFORMED -> WorkOrder
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

import networkx as nx

logger = logging.getLogger("maintix.graph")

REPO_ROOT = Path(__file__).resolve().parents[3]
GRAPH_DIR = REPO_ROOT / "ml" / "data" / "gold" / "graph"
GRAPH_FILE = GRAPH_DIR / "maintix_graph.json"


class IndustrialKnowledgeGraph:
    """NetworkX directed multigraph representing plant-wide industrial ontology."""

    def __init__(self, persist_file: Path = GRAPH_FILE):
        self.persist_file = persist_file
        self.persist_file.parent.mkdir(parents=True, exist_ok=True)
        self.graph = nx.MultiDiGraph()
        self.load()

    def add_entity(self, node_id: str, node_type: str, properties: Optional[Dict[str, Any]] = None) -> None:
        props = properties or {}
        props["node_type"] = node_type
        self.graph.add_node(node_id, **props)

    def add_relationship(
        self,
        source_id: str,
        target_id: str,
        relation_type: str,
        properties: Optional[Dict[str, Any]] = None,
    ) -> None:
        props = properties or {}
        props["relation_type"] = relation_type
        self.graph.add_edge(source_id, target_id, key=relation_type, **props)

    def get_neighbors(self, node_id: str, max_hops: int = 2) -> Dict[str, Any]:
        """Performs multi-hop graph neighborhood expansion from entity node."""
        if node_id not in self.graph:
            return {"nodes": [], "edges": []}

        subgraph_nodes = {node_id}
        current_frontier = {node_id}

        for _ in range(max_hops):
            next_frontier = set()
            for n in current_frontier:
                # Successors and predecessors
                succ = set(self.graph.successors(n))
                pred = set(self.graph.predecessors(n))
                next_frontier.update(succ | pred)
            subgraph_nodes.update(next_frontier)
            current_frontier = next_frontier

        sub = self.graph.subgraph(subgraph_nodes)

        nodes = [{"id": n, **sub.nodes[n]} for n in sub.nodes()]
        edges = [
            {"source": u, "target": v, "relation": k, **sub.get_edge_data(u, v, k)}
            for u, v, k in sub.edges(keys=True)
        ]

        return {"nodes": nodes, "edges": edges, "center_entity": node_id}

    def save(self) -> None:
        data = nx.node_link_data(self.graph, edges="edges")
        with open(self.persist_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        logger.info(f"Knowledge Graph saved -> {self.persist_file} ({self.graph.number_of_nodes()} nodes, {self.graph.number_of_edges()} edges)")

    def load(self) -> None:
        if self.persist_file.exists():
            try:
                with open(self.persist_file, "r", encoding="utf-8") as f:
                    data = json.load(f)

                edge_key = "edges" if "edges" in data else "links"

                self.graph = nx.node_link_graph(
                    data,
                    directed=True,
                    multigraph=True,
                    edges=edge_key,
                )
                logger.info(f"Loaded Knowledge Graph with {self.graph.number_of_nodes()} nodes and {self.graph.number_of_edges()} edges.")
            except Exception as e:
                logger.error(f"Error loading graph: {e}")

