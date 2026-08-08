import tempfile

from data_lake.catalog import CatalogRegistry
from data_lake.feature_store import FeatureStore
from data_lake.metadata import MetadataRegistry
from data_lake.storage import StorageManager


def test_metadata_and_catalog_registration() -> None:
    with tempfile.TemporaryDirectory() as tmpdir:
        storage = StorageManager(tmpdir)
        metadata = MetadataRegistry(storage)
        catalog = CatalogRegistry(storage)

        schema = {"columns": [{"name": "id", "dtype": "int64", "nullable": False}]}
        schema_path = metadata.register_schema("sample", schema, zone="bronze")
        assert schema_path.exists()
        assert metadata.read_schema("sample", zone="bronze")["columns"][0]["name"] == "id"

        catalog_path = catalog.register_dataset("sample", {"zone": "bronze", "path": "bronze_sample.parquet"})
        assert catalog_path.exists()
        assert catalog.read_dataset("sample")["zone"] == "bronze"


def test_feature_store_registration() -> None:
    with tempfile.TemporaryDirectory() as tmpdir:
        storage = StorageManager(tmpdir)
        feature_store = FeatureStore(storage)

        table_path = feature_store.register_feature_table("device_metrics", {"features": ["temperature", "pressure"]})
        assert table_path.exists()
        assert feature_store.read_feature_table("device_metrics")["features"] == ["temperature", "pressure"]
