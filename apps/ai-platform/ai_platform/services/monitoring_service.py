from ai_platform.core.monitoring import MonitoringService

class AiMonitoringService:
    def __init__(self, backend: MonitoringService) -> None:
        self.backend = backend

    def record(self, metric_name: str, value: float, tags: dict[str, str] | None = None) -> None:
        self.backend.record_metric(metric_name, value, tags)

    def record_event(self, event_name: str, payload: dict[str, object]) -> None:
        self.backend.record_event(event_name, payload)
