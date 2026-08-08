from __future__ import annotations

import json
from pathlib import Path
from typing import Any


class ModelRegistry:
    def __init__(self, registry_path: str | Path = "./model_registry") -> None:
        self.registry_path = Path(registry_path)
        self.registry_path.mkdir(parents=True, exist_ok=True)

    def register_version(self, model_name: str, model_path: str, stage: str = "Staging") -> Path:
        path = self.registry_path / f"{model_name}.json"
        model_file = Path(model_path)
        if model_file.exists():
            timestamp = model_file.stat().st_mtime
        else:
            timestamp = Path().stat().st_mtime
        entry = {
            "model_name": model_name,
            "model_path": model_path,
            "stage": stage,
            "timestamp": timestamp,
        }
        path.write_text(json.dumps(entry, indent=2))
        return path

    def get_model(self, model_name: str) -> dict[str, Any] | None:
        path = self.registry_path / f"{model_name}.json"
        if not path.exists():
            return None
        return json.loads(path.read_text())

    def promote(self, model_name: str, stage: str) -> None:
        entry = self.get_model(model_name)
        if not entry:
            raise ValueError(f"Model {model_name} not found")
        entry["stage"] = stage
        path = self.registry_path / f"{model_name}.json"
        path.write_text(json.dumps(entry, indent=2))
