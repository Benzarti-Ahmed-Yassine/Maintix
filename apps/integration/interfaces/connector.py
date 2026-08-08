from abc import ABC, abstractmethod
from typing import Any, Dict


class ConnectorInterface(ABC):
    """Base interface for enterprise integration connectors."""

    @abstractmethod
    def connect(self, config: Dict[str, Any]) -> None:
        raise NotImplementedError

    @abstractmethod
    def disconnect(self) -> None:
        raise NotImplementedError

    @abstractmethod
    def execute(self, payload: Any) -> Any:
        raise NotImplementedError
