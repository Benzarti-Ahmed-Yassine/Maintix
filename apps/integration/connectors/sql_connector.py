from integration.interfaces.connector import ConnectorInterface
from typing import Any, Dict


class SQLConnector(ConnectorInterface):
    """Connector stub for SQL integration."""

    def __init__(self) -> None:
        self.connected = False
        self._data: list[Dict[str, Any]] = []

    def connect(self, config: Dict[str, Any]) -> None:
        self.connected = True

    def disconnect(self) -> None:
        self.connected = False

    def execute(self, payload: Any) -> Any:
        if not self.connected:
            raise ConnectionError("SQL connector is not connected")
        if isinstance(payload, dict) and payload.get("action") == "insert":
            self._data.append(payload.get("record", {}))
            return {"inserted": 1}
        if isinstance(payload, dict) and payload.get("action") == "select":
            return {"rows": self._data}
        return {"status": "unsupported", "payload": payload}
