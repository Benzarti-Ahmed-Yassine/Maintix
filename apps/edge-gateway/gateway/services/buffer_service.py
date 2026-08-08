from __future__ import annotations

from typing import Any
from gateway.interfaces.storage import StorageInterface

class BufferService:
    def __init__(self, storage: StorageInterface) -> None:
        self.storage = storage

    def enqueue(self, key: str, payload: Any, metadata: dict[str, Any] | None = None) -> None:
        self.storage.store(key, payload, metadata)

    def dequeue(self, key: str) -> Any:
        value = self.storage.retrieve(key)
        self.storage.delete(key)
        return value

    def list_pending(self) -> list[str]:
        return self.storage.list_keys()

    def flush(self) -> dict[str, Any]:
        result: dict[str, Any] = {}
        for key in self.storage.list_keys():
            result[key] = self.storage.retrieve(key)
            self.storage.delete(key)
        return result
