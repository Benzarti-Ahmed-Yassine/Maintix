from integration.interfaces.connector import ConnectorInterface
from typing import Any, Dict


class OPCUAConnector(ConnectorInterface):
    """Connector mock for OPC-UA integration."""

    def __init__(self) -> None:
        self.connected = False
        self.nodes: Dict[str, Any] = {
            "Machine/Status": "Running",
            "Machine/Temperature": 72.3,
        }

    def connect(self, config: Dict[str, Any]) -> None:
        self.connected = True

    def disconnect(self) -> None:
        self.connected = False

    def execute(self, payload: Any) -> Any:
        if not self.connected:
            raise ConnectionError("OPC-UA connector is not connected")
        if isinstance(payload, dict):
            if payload.get("action") == "read_node":
                node_id = payload.get("node_id")
                return {"node_id": node_id, "value": self.nodes.get(node_id, None)}
            if payload.get("action") == "browse":
                return {"nodes": list(self.nodes.keys())}
        return {"status": "unsupported_action", "payload": payload}
