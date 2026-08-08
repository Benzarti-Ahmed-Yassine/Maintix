from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from .storage import ArtifactStorage


class DeploymentManager:
    def __init__(self, storage_root: str | Path = "./artifacts") -> None:
        self.artifact_storage = ArtifactStorage(storage_root)
        self.deployments_path = self.artifact_storage.deployments_path

    def deploy_model(self, model_path: str | Path, deployment_name: str, metadata: dict[str, Any] | None = None) -> Path:
        deployment_file = self.deployments_path / f"deployment_{deployment_name}.json"
        record = {
            "deployment_name": deployment_name,
            "model_path": str(model_path),
            "metadata": metadata or {},
        }
        deployment_file.write_text(json.dumps(record, indent=2))
        return deployment_file

    def list_deployments(self) -> list[Path]:
        return sorted(self.deployments_path.glob("deployment_*.json"))
