import tempfile
from pathlib import Path

import pandas as pd

from data_lake.storage import StorageManager


def test_storage_write_and_read_csv() -> None:
    with tempfile.TemporaryDirectory() as tmpdir:
        storage = StorageManager(tmpdir)
        df = pd.DataFrame({"id": [1, 2], "value": ["a", "b"]})
        path = storage.write_csv("bronze", "sample", df)

        assert Path(path).exists()
        loaded = storage.read_csv(path)
        assert loaded.to_dict(orient="list") == {"id": [1, 2], "value": ["a", "b"]}


def test_storage_write_and_read_parquet() -> None:
    with tempfile.TemporaryDirectory() as tmpdir:
        storage = StorageManager(tmpdir)
        df = pd.DataFrame({"id": [1, 2], "value": ["a", "b"]})
        path = storage.write_parquet("silver", "sample", df)

        assert Path(path).exists()
        loaded = storage.read_parquet(path)
        assert loaded.to_dict(orient="list") == {"id": [1, 2], "value": ["a", "b"]}
