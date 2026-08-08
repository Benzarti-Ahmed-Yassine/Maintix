from abc import ABC, abstractmethod
from typing import Any, Dict, List


class TransportInterface(ABC):
    """Interface for transport-level integration channels."""

    @abstractmethod
    def send(self, destination: str, message: Any, headers: Dict[str, Any] | None = None) -> None:
        raise NotImplementedError

    @abstractmethod
    def receive(self, source: str) -> Any:
        raise NotImplementedError

    @abstractmethod
    def list_endpoints(self) -> List[str]:
        raise NotImplementedError


class MockTransport(TransportInterface):
    """Simple in-memory transport implementation for integration tests."""

    def __init__(self) -> None:
        self._messages: Dict[str, list[Dict[str, Any]]] = {}

    def send(self, destination: str, message: Any, headers: Dict[str, Any] | None = None) -> None:
        self._messages.setdefault(destination, []).append({"payload": message, "headers": headers or {}})

    def receive(self, source: str) -> Any:
        return self._messages.get(source, [])

    def list_endpoints(self) -> List[str]:
        return list(self._messages.keys())
