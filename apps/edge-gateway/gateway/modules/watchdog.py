from gateway.interfaces.module import GatewayModule


class WatchdogModule(GatewayModule):
    """Supervisory watchdog for gateway process resilience."""

    def initialize(self) -> None:
        pass

    def shutdown(self) -> None:
        pass
