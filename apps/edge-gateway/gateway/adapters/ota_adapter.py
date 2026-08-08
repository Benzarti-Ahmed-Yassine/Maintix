from typing import Any, Dict

from gateway.interfaces.ota import OTAInterface


class OTAAdapter(OTAInterface):
    """Adapter for OTA update delivery and package management."""

    def check_for_updates(self) -> Dict[str, Any]:
        return {}

    def download_update(self, update_id: str) -> bool:
        return False

    def apply_update(self, package_path: str) -> bool:
        return False
