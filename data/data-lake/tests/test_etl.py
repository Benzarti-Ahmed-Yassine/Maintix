import tempfile

import pandas as pd

from data_lake.etl import DataLakeETL
from data_lake.validation import SchemaValidator


def test_etl_ingest_and_transform_to_silver() -> None:
    with tempfile.TemporaryDirectory() as tmpdir:
        etl = DataLakeETL(tmpdir)
        df = pd.DataFrame({"id": [1, 2], "value": ["a", "b"]})
        bronze_path = etl.ingest("sample", df, metadata={"source": "sensor"}, format="csv")

        assert bronze_path.exists()
        validator = SchemaValidator(required_columns=["id", "value"], column_types={"id": int, "value": str}, allow_nulls={"value": False})
        silver_path = etl.transform_to_silver("sample", validator, format="csv")

        assert silver_path.exists()
        transformed = etl.storage.read_csv(silver_path)
        assert transformed["value"].tolist() == ["a", "b"]


def test_etl_curate_to_gold() -> None:
    with tempfile.TemporaryDirectory() as tmpdir:
        etl = DataLakeETL(tmpdir)
        df = pd.DataFrame({"id": [1, 1, 2], "value": ["a", "b", "c"], "metric": [1.0, 2.0, 3.0]})
        etl.ingest("sample", df, format="parquet")
        validator = SchemaValidator(required_columns=["id", "value", "metric"], column_types={"id": int, "metric": float})
        etl.transform_to_silver("sample", validator, format="parquet")

        gold_path = etl.curate_to_gold("sample", group_by=["id"], aggregations={"metric": "mean"}, format="parquet")
        assert gold_path.exists()
        gold_df = etl.storage.read_parquet(gold_path)
        assert gold_df.loc[gold_df.id == 1, "metric"].iloc[0] == 1.5
