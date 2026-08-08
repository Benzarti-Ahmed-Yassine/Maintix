from abc import ABC, abstractmethod
from typing import Any, Dict


class ConfigurationInterface(ABC):
    """Interface for edge gateway configuration management."""

    @abstractmethod
    def load(self) -> Dict[str, Any]:
        raise NotImplementedError

    @abstractmethod
    def save(self, config: Dict[str, Any]) -> None:
        raise NotImplementedError

    @abstractmethod
    def reload(self) -> None:
        raise NotImplementedError
