from abc import ABC, abstractmethod
from typing import Dict, Any


class OTAInterface(ABC):
    """Interface for over-the-air update operations."""

    @abstractmethod
    def check_for_updates(self) -> Dict[str, Any]:
        raise NotImplementedError

    @abstractmethod
    def download_update(self, update_id: str) -> bool:
        raise NotImplementedError

    @abstractmethod
    def apply_update(self, package_path: str) -> bool:
        raise NotImplementedError
