from abc import ABC, abstractmethod
from typing import Dict, Any


class DiagnosticsInterface(ABC):
    """Interface for health checks and diagnostics reporting."""

    @abstractmethod
    def run_health_check(self) -> Dict[str, Any]:
        raise NotImplementedError

    @abstractmethod
    def collect_metrics(self) -> Dict[str, Any]:
        raise NotImplementedError
