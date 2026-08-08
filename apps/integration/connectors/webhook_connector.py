from integration.interfaces.connector import ConnectorInterface
from typing import Any, Dict


class WebhookConnector(ConnectorInterface):
    """Connector stub for webhook integration."""

    def __init__(self) -> None:
        self.connected = False
        self.events: list[Dict[str, Any]] = []

    def connect(self, config: Dict[str, Any]) -> None:
        self.connected = True

    def disconnect(self) -> None:
        self.connected = False

    def execute(self, payload: Any) -> Any:
        if not self.connected:
            raise ConnectionError("Webhook connector is not connected")
        self.events.append(payload)
        return {"delivered": True, "events": len(self.events)}
