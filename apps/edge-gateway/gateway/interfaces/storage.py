from abc import ABC, abstractmethod
from typing import Any, Dict, List


class StorageInterface(ABC):
    """Interface for local storage and buffering backends."""

    @abstractmethod
    def store(self, key: str, value: Any, metadata: Dict[str, Any] | None = None) -> None:
        raise NotImplementedError

    @abstractmethod
    def retrieve(self, key: str) -> Any:
        raise NotImplementedError

    @abstractmethod
    def list_keys(self) -> List[str]:
        raise NotImplementedError

    @abstractmethod
    def delete(self, key: str) -> None:
        raise NotImplementedError
