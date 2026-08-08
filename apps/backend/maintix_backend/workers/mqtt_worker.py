from maintix_backend.core.messaging.mqtt_client import MqttClient
from maintix_backend.core.events.event_bus import EventBus

class MqttWorker:
    @staticmethod
    async def start() -> None:
        client = MqttClient.get()
        client.subscribe('maintix/telemetry')
        client.on_message = MqttWorker.on_message

    @staticmethod
    def on_message(client, userdata, message) -> None:
        EventBus.publish('mqtt.message', {'topic': message.topic, 'payload': message.payload.decode()})
