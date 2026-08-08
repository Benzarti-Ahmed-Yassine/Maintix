from gateway.interfaces.module import GatewayModule
from gateway.interfaces.device import DeviceManagerInterface


class DeviceManagerModule(GatewayModule):
    """Device discovery, registration, and command execution."""

    def __init__(self, device_manager: DeviceManagerInterface) -> None:
        self.device_manager = device_manager

    def initialize(self) -> None:
        pass

    def shutdown(self) -> None:
        pass
