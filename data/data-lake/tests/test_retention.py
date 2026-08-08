import tempfile
from pathlib import Path

import pandas as pd

from data_lake.retention import RetentionManager
from data_lake.storage import StorageManager


def test_retention_max_files() -> None:
    with tempfile.TemporaryDirectory() as tmpdir:
        storage = StorageManager(tmpdir)
        retention = RetentionManager(storage)
        for idx in range(5):
            df = pd.DataFrame({"id": [idx]})
            storage.write_parquet("archive", f"sample_{idx}", df)

        removed = retention.apply_retention("archive", max_files=2)
        assert len(removed) == 3
        remaining = list(storage.zone_path("archive").glob("*"))
        assert len(remaining) == 2


def test_retention_max_age() -> None:
    with tempfile.TemporaryDirectory() as tmpdir:
        storage = StorageManager(tmpdir)
        retention = RetentionManager(storage)
        df = pd.DataFrame({"id": [1]})
        path = storage.write_parquet("archive", "old_sample", df)
        Path(path).write_text(Path(path).read_text())
        removed = retention.apply_retention("archive", max_age_days=0)
        assert str(path) in removed
