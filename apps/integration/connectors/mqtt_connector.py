from integration.interfaces.connector import ConnectorInterface
from typing import Any, Dict


class MQTTConnector(ConnectorInterface):
    """Connector stub for MQTT integration."""

    def __init__(self) -> None:
        self.connected = False
        self._messages: list[Dict[str, Any]] = []

    def connect(self, config: Dict[str, Any]) -> None:
        self.connected = True

    def disconnect(self) -> None:
        self.connected = False

    def execute(self, payload: Any) -> Any:
        if not self.connected:
            raise ConnectionError("MQTT connector is not connected")
        self._messages.append({"payload": payload, "config": {}})
        return {"published": True, "count": len(self._messages)}
