from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pandas as pd


class StorageManager:
    def __init__(self, root_path: str | Path) -> None:
        self.root_path = Path(root_path)
        self.root_path.mkdir(parents=True, exist_ok=True)

    def zone_path(self, zone: str) -> Path:
        path = self.root_path / zone
        path.mkdir(parents=True, exist_ok=True)
        return path

    def dataset_path(self, zone: str, dataset_name: str, extension: str) -> Path:
        return self.zone_path(zone) / f"{zone}_{dataset_name}.{extension}"

    def write_csv(self, zone: str, dataset_name: str, dataframe: pd.DataFrame) -> Path:
        path = self.dataset_path(zone, dataset_name, "csv")
        dataframe.to_csv(path, index=False)
        return path

    def read_csv(self, path: str | Path) -> pd.DataFrame:
        return pd.read_csv(path)

    def write_parquet(self, zone: str, dataset_name: str, dataframe: pd.DataFrame) -> Path:
        path = self.dataset_path(zone, dataset_name, "parquet")
        dataframe.to_parquet(path, index=False)
        return path

    def read_parquet(self, path: str | Path) -> pd.DataFrame:
        return pd.read_parquet(path)

    def write_dataset(self, zone: str, dataset_name: str, dataframe: pd.DataFrame, format: str = "parquet") -> Path:
        if format == "csv":
            return self.write_csv(zone, dataset_name, dataframe)
        return self.write_parquet(zone, dataset_name, dataframe)

    def read_dataset(self, path: str | Path) -> pd.DataFrame:
        path = Path(path)
        if path.suffix == ".csv":
            return self.read_csv(path)
        if path.suffix == ".parquet":
            return self.read_parquet(path)
        raise ValueError(f"Unsupported dataset format: {path.suffix}")

    def write_json(self, zone: str, dataset_name: str, payload: dict[str, Any]) -> Path:
        path = self.dataset_path(zone, dataset_name, "json")
        path.write_text(json.dumps(payload, indent=2))
        return path

    def read_json(self, path: str | Path) -> dict[str, Any]:
        return json.loads(Path(path).read_text())

    def list_zone_files(self, zone: str) -> list[Path]:
        return sorted(self.zone_path(zone).glob("**/*"))

    def delete_file(self, path: str | Path) -> None:
        path = Path(path)
        if path.exists():
            path.unlink()
