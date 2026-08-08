from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List

from gateway.interfaces.storage import StorageInterface

class LocalStorageAdapter(StorageInterface):
    def __init__(self, storage_dir: str = '/tmp/gateway_storage') -> None:
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(parents=True, exist_ok=True)

    def _path(self, key: str) -> Path:
        return self.storage_dir / f"{key}.json"

    def store(self, key: str, value: Any, metadata: Dict[str, Any] | None = None) -> None:
        payload = {'value': value, 'metadata': metadata or {}}
        self._path(key).write_text(json.dumps(payload, indent=2))

    def retrieve(self, key: str) -> Any:
        path = self._path(key)
        if not path.exists():
            return None
        payload = json.loads(path.read_text())
        return payload.get('value')

    def list_keys(self) -> List[str]:
        return [path.stem for path in self.storage_dir.glob('*.json')] 

    def delete(self, key: str) -> None:
        path = self._path(key)
        if path.exists():
            path.unlink()
