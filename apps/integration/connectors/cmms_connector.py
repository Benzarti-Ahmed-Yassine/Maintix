from integration.interfaces.connector import ConnectorInterface
from typing import Any, Dict


class CMMSConnector(ConnectorInterface):
    """Connector mock for CMMS integration."""

    def __init__(self) -> None:
        self.connected = False
        self.work_orders: list[Dict[str, Any]] = []

    def connect(self, config: Dict[str, Any]) -> None:
        self.connected = True

    def disconnect(self) -> None:
        self.connected = False

    def execute(self, payload: Any) -> Any:
        if not self.connected:
            raise ConnectionError("CMMS connector is not connected")
        if isinstance(payload, dict) and payload.get("action") == "create_work_order":
            work_order = {
                "work_order_id": f"WO-{len(self.work_orders) + 1:04d}",
                "status": "open",
                **payload.get("details", {}),
            }
            self.work_orders.append(work_order)
            return work_order
        if isinstance(payload, dict) and payload.get("action") == "list_work_orders":
            return {"work_orders": self.work_orders}
        return {"status": "unsupported_action", "payload": payload}
