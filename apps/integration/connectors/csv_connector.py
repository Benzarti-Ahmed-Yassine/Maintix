from integration.interfaces.connector import ConnectorInterface
from typing import Any, Dict
import csv
import io


class CSVConnector(ConnectorInterface):
    """Connector mock for CSV integration."""

    def __init__(self) -> None:
        self.connected = False
        self.config: Dict[str, Any] = {}

    def connect(self, config: Dict[str, Any]) -> None:
        self.connected = True
        self.config = config

    def disconnect(self) -> None:
        self.connected = False
        self.config = {}

    def execute(self, payload: Any) -> Any:
        if not self.connected:
            raise ConnectionError("CSV connector is not connected")
        if isinstance(payload, dict) and payload.get("action") == "write":
            delimiter = self.config.get("delimiter", ",")
            output = io.StringIO()
            writer = csv.DictWriter(output, fieldnames=payload.get("headers", []), delimiter=delimiter)
            writer.writeheader()
            writer.writerows(payload.get("rows", []))
            return {"csv": output.getvalue()}
        if isinstance(payload, dict) and payload.get("action") == "read":
            delimiter = self.config.get("delimiter", ",")
            data = io.StringIO(payload.get("csv", ""))
            reader = csv.DictReader(data, delimiter=delimiter)
            return {"rows": [row for row in reader]}
        return {"status": "unsupported_action", "payload": payload}
