from __future__ import annotations

from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

from .storage import StorageManager


class RetentionManager:
    def __init__(self, storage: StorageManager) -> None:
        self.storage = storage

    def apply_retention(self, zone: str, max_age_days: int | None = None, max_files: int | None = None) -> list[str]:
        files = sorted(self.storage.zone_path(zone).glob("*"), key=lambda p: p.stat().st_mtime)
        removed: list[str] = []

        if max_age_days is not None:
            threshold = datetime.utcnow() - timedelta(days=max_age_days)
            for path in files:
                if datetime.utcfromtimestamp(path.stat().st_mtime) < threshold:
                    path.unlink()
                    removed.append(str(path))

        if max_files is not None and len(files) > max_files:
            surplus = files[: len(files) - max_files]
            for path in surplus:
                if path.exists():
                    path.unlink()
                    removed.append(str(path))

        return removed
