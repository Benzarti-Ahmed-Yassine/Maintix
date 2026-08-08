from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from .storage import StorageManager


class CatalogRegistry:
    def __init__(self, storage: StorageManager) -> None:
        self.storage = storage
        self.catalog_path = self.storage.root_path / "catalog"
        self.catalog_path.mkdir(parents=True, exist_ok=True)

    def register_dataset(self, dataset_name: str, dataset_info: dict[str, Any]) -> Path:
        path = self.catalog_path / f"catalog_{dataset_name}.json"
        path.write_text(json.dumps(dataset_info, indent=2))
        return path

    def read_dataset(self, dataset_name: str) -> dict[str, Any] | None:
        path = self.catalog_path / f"catalog_{dataset_name}.json"
        if not path.exists():
            return None
        return json.loads(path.read_text())

    def list_datasets(self) -> list[Path]:
        return sorted(self.catalog_path.glob("catalog_*.json"))
