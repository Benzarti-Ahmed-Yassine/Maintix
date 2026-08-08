from __future__ import annotations

from pathlib import Path
from typing import Any

import joblib


class ArtifactStorage:
    def __init__(self, root_path: str | Path) -> None:
        self.root_path = Path(root_path)
        self.models_path = self.root_path / "models"
        self.deployments_path = self.root_path / "deployments"
        self.models_path.mkdir(parents=True, exist_ok=True)
        self.deployments_path.mkdir(parents=True, exist_ok=True)

    def save_model(self, model: Any, model_name: str) -> Path:
        path = self.models_path / f"{model_name}.joblib"
        joblib.dump(model, path)
        return path

    def load_model(self, model_path: str | Path) -> Any:
        return joblib.load(model_path)

    def write_artifact(self, artifact_name: str, data: Any) -> Path:
        path = self.root_path / f"{artifact_name}.joblib"
        joblib.dump(data, path)
        return path

    def write_json(self, artifact_name: str, payload: dict[str, Any]) -> Path:
        path = self.root_path / f"{artifact_name}.json"
        path.write_text(__import__("json").dumps(payload, indent=2))
        return path

    def list_models(self) -> list[Path]:
        return sorted(self.models_path.glob("*.joblib"))
