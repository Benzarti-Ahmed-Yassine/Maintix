import os
from urllib.parse import urlparse

from dotenv import load_dotenv
import paho.mqtt.client as mqtt

load_dotenv()


def _get_broker_settings() -> tuple[str, int]:
    broker_url = os.getenv('MQTT_BROKER')
    if broker_url:
        parsed = urlparse(broker_url)
        host = parsed.hostname or 'localhost'
        port = parsed.port or 1883
        return host, port

    return os.getenv('MQTT_HOST', 'localhost'), int(os.getenv('MQTT_PORT', '1883'))


class MqttClient:
    _client: mqtt.Client | None = None

    @classmethod
    async def connect(cls) -> None:
        host, port = _get_broker_settings()
        cls._client = mqtt.Client()
        cls._client.connect(host, port)
        cls._client.loop_start()

    @classmethod
    async def disconnect(cls) -> None:
        if cls._client is not None:
            cls._client.loop_stop()
            cls._client.disconnect()
            cls._client = None

    @classmethod
    def get(cls) -> mqtt.Client:
        if cls._client is None:
            raise RuntimeError('MQTT client not connected')
        return cls._client
