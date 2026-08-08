from gateway.interfaces.module import GatewayModule
from gateway.interfaces.diagnostics import DiagnosticsInterface


class DiagnosticsModule(GatewayModule):
    """Gateway diagnostics and self-monitoring module."""

    def __init__(self, diagnostics_service: DiagnosticsInterface) -> None:
        self.diagnostics_service = diagnostics_service

    def initialize(self) -> None:
        pass

    def shutdown(self) -> None:
        pass
