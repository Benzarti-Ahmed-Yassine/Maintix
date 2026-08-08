from gateway.interfaces.module import GatewayModule
from gateway.interfaces.ota import OTAInterface


class OTAModule(GatewayModule):
    """Module for firmware and software update orchestration."""

    def __init__(self, ota_service: OTAInterface) -> None:
        self.ota_service = ota_service

    def initialize(self) -> None:
        pass

    def shutdown(self) -> None:
        pass
