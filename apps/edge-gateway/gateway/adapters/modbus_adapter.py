from typing import Any, Dict

from gateway.interfaces.communication import CommunicationInterface


class ModbusAdapter(CommunicationInterface):
    """Adapter for Modbus TCP/RTU transport."""

    def connect(self) -> None:
        pass

    def disconnect(self) -> None:
        pass

    def publish(self, topic: str, payload: Any, metadata: Dict[str, Any] | None = None) -> None:
        pass

    def subscribe(self, topic: str) -> None:
        pass

    def get_subscriptions(self) -> list[str]:
        return []
