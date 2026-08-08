from typing import Any, Dict


class RestAPIService:
    """Local REST API service for gateway management and telemetry."""

    def start(self) -> None:
        pass

    def stop(self) -> None:
        pass

    def get_status(self) -> Dict[str, Any]:
        return {}
