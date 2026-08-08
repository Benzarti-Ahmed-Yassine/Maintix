from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from .storage import StorageManager


class FeatureStore:
    def __init__(self, storage: StorageManager) -> None:
        self.storage = storage
        self.feature_store_path = self.storage.root_path / "feature_store"
        self.feature_store_path.mkdir(parents=True, exist_ok=True)

    def register_feature_table(self, table_name: str, definitions: dict[str, Any]) -> Path:
        path = self.feature_store_path / f"feature_{table_name}.json"
        path.write_text(json.dumps(definitions, indent=2))
        return path

    def read_feature_table(self, table_name: str) -> dict[str, Any] | None:
        path = self.feature_store_path / f"feature_{table_name}.json"
        if not path.exists():
            return None
        return json.loads(path.read_text())

    def list_feature_tables(self) -> list[Path]:
        return sorted(self.feature_store_path.glob("feature_*.json"))
