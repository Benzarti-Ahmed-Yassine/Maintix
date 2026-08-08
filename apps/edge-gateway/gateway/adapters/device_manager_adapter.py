from typing import Any, Dict

from gateway.interfaces.device import DeviceManagerInterface


class DeviceManagerAdapter(DeviceManagerInterface):
    """Adapter for device lifecycle and command management."""

    def discover_devices(self) -> list[Dict[str, Any]]:
        return []

    def register_device(self, device_info: Dict[str, Any]) -> str:
        return ""

    def send_command(self, device_id: str, command: Dict[str, Any]) -> bool:
        return False

    def get_device_status(self, device_id: str) -> Dict[str, Any]:
        return {}
