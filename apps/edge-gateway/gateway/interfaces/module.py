from abc import ABC, abstractmethod


class GatewayModule(ABC):
    """Base interface for edge gateway modules."""

    @abstractmethod
    def initialize(self) -> None:
        raise NotImplementedError

    @abstractmethod
    def shutdown(self) -> None:
        raise NotImplementedError
