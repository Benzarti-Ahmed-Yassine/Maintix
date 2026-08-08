from gateway.interfaces.module import GatewayModule
from gateway.interfaces.storage import StorageInterface


class BufferModule(GatewayModule):
    """Local buffering and retry queue management."""

    def __init__(self, storage: StorageInterface) -> None:
        self.storage = storage

    def initialize(self) -> None:
        pass

    def shutdown(self) -> None:
        pass
