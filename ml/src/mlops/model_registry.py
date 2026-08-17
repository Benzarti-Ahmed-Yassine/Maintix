"""
MAINTIX MLOps Model Registry
============================
Manages model metadata, lifecycle states, artifact storage, and versioning.

Lifecycle States:
- EXPERIMENTAL: Initial research runs
- CHALLENGER: Evaluated candidate competing against production champion
- VALIDATED: Passed safety, drift, and leakage audits
- PRODUCTION: Active serving model
- ARCHIVED: Superseded previous champions
- REJECTED: Failed acceptance criteria
"""

from __future__ import annotations

import json
import logging
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger("maintix.registry")

REPO_ROOT = Path(__file__).resolve().parents[3]
REGISTRY_DIR = REPO_ROOT / "ml" / "mlops" / "registry"
REGISTRY_FILE = REGISTRY_DIR / "registry_state.json"


@dataclass
class ModelMetadata:
    model_id: str
    model_name: str
    model_type: str  # RUL | ANOMALY | FAILURE | RL_POLICY
    version: str
    dataset_version: str
    features_version: str
    training_date: str
    metrics: Dict[str, Any]
    parameters: Dict[str, Any]
    artifact_path: str
    status: str  # EXPERIMENTAL | CHALLENGER | VALIDATED | PRODUCTION | ARCHIVED | REJECTED
    promoted_at: Optional[str] = None
    rejection_reason: Optional[str] = None


class ModelRegistry:
    """Production Model Registry for MAINTIX AI models."""

    def __init__(self, registry_file: Path = REGISTRY_FILE):
        self.registry_file = registry_file
        self.registry_file.parent.mkdir(parents=True, exist_ok=True)
        self.state = self._load()

    def _load(self) -> Dict[str, Any]:
        if self.registry_file.exists():
            try:
                with open(self.registry_file, "r") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading registry: {e}")
        return {"models": [], "champion_pointers": {}}

    def _save(self) -> None:
        with open(self.registry_file, "w") as f:
            json.dump(self.state, f, indent=2)

    def register_model(self, meta: ModelMetadata) -> ModelMetadata:
        """Registers a new model version in the registry."""
        # Check if version exists
        for idx, m in enumerate(self.state["models"]):
            if m["model_id"] == meta.model_id:
                self.state["models"][idx] = asdict(meta)
                self._save()
                logger.info(f"Updated registered model: {meta.model_id} ({meta.status})")
                return meta

        self.state["models"].append(asdict(meta))
        self._save()
        logger.info(f"Registered new model: {meta.model_id} (Status: {meta.status})")
        return meta

    def promote_to_production(self, model_id: str) -> bool:
        """Promotes a validated model to PRODUCTION, archiving the previous champion."""
        target = None
        for m in self.state["models"]:
            if m["model_id"] == model_id:
                target = m
                break

        if not target:
            logger.error(f"Cannot promote: Model {model_id} not found.")
            return False

        model_type = target["model_type"]
        current_champion_id = self.state["champion_pointers"].get(model_type)

        # Archive old champion
        if current_champion_id and current_champion_id != model_id:
            for m in self.state["models"]:
                if m["model_id"] == current_champion_id:
                    m["status"] = "ARCHIVED"
                    logger.info(f"Archived previous champion: {current_champion_id}")

        target["status"] = "PRODUCTION"
        target["promoted_at"] = datetime.now(timezone.utc).isoformat()
        self.state["champion_pointers"][model_type] = model_id
        self._save()
        logger.info(f"🏆 Model {model_id} is now PRODUCTION champion for task '{model_type}'")
        return True

    def get_champion(self, model_type: str) -> Optional[Dict[str, Any]]:
        """Retrieves active production champion metadata for model_type."""
        champ_id = self.state["champion_pointers"].get(model_type)
        if not champ_id:
            return None
        for m in self.state["models"]:
            if m["model_id"] == champ_id:
                return m
        return None

    def list_models(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        if status:
            return [m for m in self.state["models"] if m["status"] == status]
        return self.state["models"]
