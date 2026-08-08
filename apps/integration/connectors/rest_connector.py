from integration.interfaces.connector import ConnectorInterface
from typing import Any, Dict


class RESTConnector(ConnectorInterface):
    """Connector stub for REST integration."""

    def __init__(self) -> None:
        self.connected = False

    def connect(self, config: Dict[str, Any]) -> None:
        self.connected = True

    def disconnect(self) -> None:
        self.connected = False

    def execute(self, payload: Any) -> Any:
        if not self.connected:
            raise ConnectionError("REST connector is not connected")
        return {"status": "ok", "body": payload}
