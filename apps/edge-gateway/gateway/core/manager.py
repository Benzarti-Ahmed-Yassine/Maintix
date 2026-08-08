from typing import List

from gateway.interfaces.module import GatewayModule


class RuntimeManager:
    """Manages gateway module lifecycle and orchestration."""

    def __init__(self) -> None:
        self.modules: List[GatewayModule] = []

    def register_module(self, module: GatewayModule) -> None:
        self.modules.append(module)

    def start(self) -> None:
        for module in self.modules:
            module.initialize()

    def stop(self) -> None:
        for module in reversed(self.modules):
            module.shutdown()
