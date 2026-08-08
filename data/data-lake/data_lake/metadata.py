from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from .storage import StorageManager


class MetadataRegistry:
    def __init__(self, storage: StorageManager) -> None:
        self.storage = storage
        self.metadata_path = self.storage.root_path / "metadata"
        self.metadata_path.mkdir(parents=True, exist_ok=True)

    def register_schema(self, dataset_name: str, schema: dict[str, Any], zone: str = "bronze") -> Path:
        path = self.metadata_path / f"schema_{zone}_{dataset_name}.json"
        path.write_text(json.dumps(schema, indent=2))
        return path

    def read_schema(self, dataset_name: str, zone: str = "bronze") -> dict[str, Any] | None:
        path = self.metadata_path / f"schema_{zone}_{dataset_name}.json"
        if not path.exists():
            return None
        return json.loads(path.read_text())

    def list_schemas(self) -> list[Path]:
        return sorted(self.metadata_path.glob("schema_*.json"))
