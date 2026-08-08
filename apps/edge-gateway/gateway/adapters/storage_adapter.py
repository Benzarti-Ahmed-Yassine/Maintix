from typing import Any, Dict, List

from gateway.interfaces.storage import StorageInterface


class StorageAdapter(StorageInterface):
    """Adapter for local persistence and buffering stores."""

    def store(self, key: str, value: Any, metadata: Dict[str, Any] | None = None) -> None:
        pass

    def retrieve(self, key: str) -> Any:
        return None

    def list_keys(self) -> List[str]:
        return []

    def delete(self, key: str) -> None:
        pass
