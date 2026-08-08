from gateway.interfaces.module import GatewayModule
from gateway.interfaces.configuration import ConfigurationInterface


class ConfigurationModule(GatewayModule):
    """Gateway configuration management and dynamic reload."""

    def __init__(self, config_service: ConfigurationInterface) -> None:
        self.config_service = config_service

    def initialize(self) -> None:
        self.config_service.load()

    def shutdown(self) -> None:
        pass
