from abc import ABC, abstractmethod
from typing import Any, Dict


class DeviceManagerInterface(ABC):
    """Interface for device lifecycle and command management."""

    @abstractmethod
    def discover_devices(self) -> list[Dict[str, Any]]:
        raise NotImplementedError

    @abstractmethod
    def register_device(self, device_info: Dict[str, Any]) -> str:
        raise NotImplementedError

    @abstractmethod
    def send_command(self, device_id: str, command: Dict[str, Any]) -> bool:
        raise NotImplementedError

    @abstractmethod
    def get_device_status(self, device_id: str) -> Dict[str, Any]:
        raise NotImplementedError
