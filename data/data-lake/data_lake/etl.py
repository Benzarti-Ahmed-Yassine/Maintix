from __future__ import annotations

from pathlib import Path
from typing import Any

import pandas as pd

from .catalog import CatalogRegistry
from .feature_store import FeatureStore
from .logging_config import get_logger
from .metadata import MetadataRegistry
from .retention import RetentionManager
from .storage import StorageManager
from .validation import SchemaValidator, ValidationResult


class DataLakeETL:
    def __init__(self, root_path: str | Path) -> None:
        self.storage = StorageManager(root_path)
        self.metadata = MetadataRegistry(self.storage)
        self.catalog = CatalogRegistry(self.storage)
        self.feature_store = FeatureStore(self.storage)
        self.retention = RetentionManager(self.storage)
        self.logger = get_logger()

    def ingest(self, dataset_name: str, dataframe: pd.DataFrame, metadata: dict[str, Any] | None = None, format: str = "parquet") -> Path:
        self.logger.info("Ingesting dataset %s into bronze zone", dataset_name)
        path = self.storage.write_dataset("bronze", dataset_name, dataframe, format=format)
        self.metadata.register_schema(dataset_name, self._describe_schema(dataframe))
        self.catalog.register_dataset(dataset_name, {
            "zone": "bronze",
            "path": str(path),
            "format": format,
            "metadata": metadata or {},
        })
        return path

    def transform_to_silver(self, dataset_name: str, validator: SchemaValidator, format: str = "parquet") -> Path:
        bronze_path = self.storage.dataset_path("bronze", dataset_name, format)
        self.logger.info("Transforming dataset %s from bronze to silver", dataset_name)
        dataframe = self.storage.read_dataset(bronze_path)
        validation = validator.validate_dataframe(dataframe)
        if not validation.success:
            self.logger.error("Validation failed for %s: %s", dataset_name, validation.errors)
            raise ValueError("Validation failed: " + "; ".join(validation.errors))

        cleaned = self._clean_dataframe(dataframe)
        silver_path = self.storage.write_dataset("silver", dataset_name, cleaned, format=format)
        self.metadata.register_schema(dataset_name, self._describe_schema(cleaned), zone="silver")
        self.catalog.register_dataset(dataset_name, {
            "zone": "silver",
            "path": str(silver_path),
            "format": format,
            "source": str(bronze_path),
        })
        return silver_path

    def curate_to_gold(self, dataset_name: str, group_by: list[str], aggregations: dict[str, str], format: str = "parquet") -> Path:
        silver_path = self.storage.dataset_path("silver", dataset_name, format)
        self.logger.info("Curating dataset %s into gold", dataset_name)
        dataframe = self.storage.read_dataset(silver_path)
        aggregated = dataframe.groupby(group_by).agg(aggregations).reset_index()
        gold_path = self.storage.write_dataset("gold", dataset_name, aggregated, format=format)
        self.metadata.register_schema(dataset_name, self._describe_schema(aggregated), zone="gold")
        self.catalog.register_dataset(dataset_name, {
            "zone": "gold",
            "path": str(gold_path),
            "format": format,
            "source": str(silver_path),
            "group_by": group_by,
            "aggregations": aggregations,
        })
        return gold_path

    def register_feature_table(self, table_name: str, feature_definitions: dict[str, Any]) -> Path:
        self.logger.info("Registering feature table %s", table_name)
        return self.feature_store.register_feature_table(table_name, feature_definitions)

    def apply_retention(self, zone: str, max_age_days: int | None = None, max_files: int | None = None) -> list[str]:
        self.logger.info("Applying retention to zone %s", zone)
        return self.retention.apply_retention(zone, max_age_days=max_age_days, max_files=max_files)

    def _describe_schema(self, dataframe: pd.DataFrame) -> dict[str, Any]:
        return {
            "columns": [
                {"name": column, "dtype": str(dataframe[column].dtype), "nullable": dataframe[column].isna().any()}
                for column in dataframe.columns
            ]
        }

    def _clean_dataframe(self, dataframe: pd.DataFrame) -> pd.DataFrame:
        normalized = dataframe.copy()
        for column in normalized.select_dtypes(include=["string", "object"]):
            normalized[column] = normalized[column].astype(str).str.strip()
        return normalized
