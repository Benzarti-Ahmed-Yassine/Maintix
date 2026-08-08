from typing import Any, Dict

from gateway.interfaces.configuration import ConfigurationInterface


class ConfigurationAdapter(ConfigurationInterface):
    """Adapter for gateway configuration storage and retrieval."""

    def load(self) -> Dict[str, Any]:
        return {}

    def save(self, config: Dict[str, Any]) -> None:
        pass

    def reload(self) -> None:
        pass
