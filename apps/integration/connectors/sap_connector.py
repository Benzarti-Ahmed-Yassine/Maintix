from integration.interfaces.connector import ConnectorInterface
from typing import Any, Dict


class SAPConnector(ConnectorInterface):
    """Connector mock for SAP integration."""

    def __init__(self) -> None:
        self.connected = False
        self._responses: Dict[str, Any] = {
            "material_check": {"available": True, "quantity": 120},
            "order_create": {"order_id": "SAP-1001", "status": "created"},
        }

    def connect(self, config: Dict[str, Any]) -> None:
        self.connected = True

    def disconnect(self) -> None:
        self.connected = False

    def execute(self, payload: Any) -> Any:
        if not self.connected:
            raise ConnectionError("SAP connector is not connected")
        if isinstance(payload, dict) and (action := payload.get("action")):
            return self._responses.get(action, {"status": "unknown_action", "action": action})
        return {"status": "invalid_payload"}
