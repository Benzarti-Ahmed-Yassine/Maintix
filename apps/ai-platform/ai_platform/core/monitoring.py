from typing import Any

class MonitoringService:
    def record_metric(self, name: str, value: float, tags: dict[str, str] | None = None) -> None:
        pass

    def record_event(self, name: str, payload: dict[str, Any]) -> None:
        pass

    def track_drift(self, feature_name: str, drift_score: float) -> None:
        pass
