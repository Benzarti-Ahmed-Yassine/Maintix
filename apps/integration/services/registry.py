from typing import Any, Dict
from integration.interfaces.connector import ConnectorInterface


class ConnectorRegistry:
    """Registry for available integration connectors."""

    def __init__(self) -> None:
        self._connectors: Dict[str, ConnectorInterface] = {}

    def register_connector(self, name: str, connector: ConnectorInterface) -> None:
        self._connectors[name] = connector

    def list_connectors(self) -> Dict[str, ConnectorInterface]:
        return dict(self._connectors)

    def get_connector(self, name: str) -> ConnectorInterface:
        connector = self._connectors.get(name)
        if connector is None:
            raise KeyError(f"No connector registered under name '{name}'")
        return connector

    def clear(self) -> None:
        self._connectors.clear()
