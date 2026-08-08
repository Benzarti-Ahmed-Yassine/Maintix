from abc import ABC, abstractmethod
from typing import Any, Dict, List


class CommunicationInterface(ABC):
    """Abstract interface for gateway communication channels."""

    @abstractmethod
    def connect(self) -> None:
        raise NotImplementedError

    @abstractmethod
    def disconnect(self) -> None:
        raise NotImplementedError

    @abstractmethod
    def publish(self, topic: str, payload: Any, metadata: Dict[str, Any] | None = None) -> None:
        raise NotImplementedError

    @abstractmethod
    def subscribe(self, topic: str) -> None:
        raise NotImplementedError

    @abstractmethod
    def get_subscriptions(self) -> List[str]:
        raise NotImplementedError
