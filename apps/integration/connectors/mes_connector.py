from integration.interfaces.connector import ConnectorInterface
from typing import Any, Dict


class MESConnector(ConnectorInterface):
    """Connector mock for MES integration."""

    def __init__(self) -> None:
        self.connected = False
        self.production_runs: list[Dict[str, Any]] = []

    def connect(self, config: Dict[str, Any]) -> None:
        self.connected = True

    def disconnect(self) -> None:
        self.connected = False

    def execute(self, payload: Any) -> Any:
        if not self.connected:
            raise ConnectionError("MES connector is not connected")
        if isinstance(payload, dict) and payload.get("action") == "start_run":
            run = {"run_id": f"MES-{len(self.production_runs) + 1}", "status": "running", **payload.get("details", {})}
            self.production_runs.append(run)
            return run
        if isinstance(payload, dict) and payload.get("action") == "list_runs":
            return {"runs": self.production_runs}
        return {"status": "unsupported_action", "payload": payload}
