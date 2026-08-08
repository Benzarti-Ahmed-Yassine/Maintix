from typing import Any, Dict

from gateway.interfaces.diagnostics import DiagnosticsInterface


class DiagnosticsAdapter(DiagnosticsInterface):
    """Adapter for diagnostics and health telemetry collection."""

    def run_health_check(self) -> Dict[str, Any]:
        return {}

    def collect_metrics(self) -> Dict[str, Any]:
        return {}
