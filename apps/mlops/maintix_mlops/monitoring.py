from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any


class MonitoringService:
    def __init__(self, log_path: str | Path = "./monitoring/logs") -> None:
        self.log_path = Path(log_path)
        self.log_path.mkdir(parents=True, exist_ok=True)

    def record_metric(self, name: str, value: float, metadata: dict[str, Any] | None = None) -> Path:
        entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "metric": name,
            "value": value,
            "metadata": metadata or {},
        }
        path = self.log_path / f"metric_{name}_{int(datetime.utcnow().timestamp())}.json"
        path.write_text(json.dumps(entry, indent=2))
        return path

    def read_metrics(self) -> list[dict[str, Any]]:
        records: list[dict[str, Any]] = []
        for path in sorted(self.log_path.glob("metric_*.json")):
            records.append(json.loads(path.read_text()))
        return records
