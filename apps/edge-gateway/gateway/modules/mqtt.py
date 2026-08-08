from gateway.interfaces.communication import CommunicationInterface
from gateway.interfaces.module import GatewayModule


class MQTTModule(GatewayModule):
    """Module responsible for MQTT connectivity and topic routing."""

    def __init__(self, mqtt_client: CommunicationInterface) -> None:
        self.mqtt_client = mqtt_client

    def initialize(self) -> None:
        self.mqtt_client.connect()

    def shutdown(self) -> None:
        self.mqtt_client.disconnect()
