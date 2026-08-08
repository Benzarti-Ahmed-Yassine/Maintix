from typing import Any, Dict

from gateway.interfaces.communication import CommunicationInterface


class RestAPIAdapter(CommunicationInterface):
    """Adapter for local REST API interactions."""

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
