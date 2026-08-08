from fastapi import FastAPI
from maintix_backend.api import api_router
from maintix_backend.core.events.event_bus import EventBus
from maintix_backend.core.messaging.mqtt_client import MqttClient
from maintix_backend.core.messaging.redis_client import RedisClient
from maintix_backend.core.security.token_provider import TokenProvider
from maintix_backend.db.session import create_session_factory


def register_routes(app: FastAPI) -> None:
    app.include_router(api_router)


def register_lifespan(app: FastAPI) -> None:
    @app.on_event('startup')
    async def startup() -> None:
        await RedisClient.connect()
        await MqttClient.connect()
        await EventBus.initialize()
        await create_session_factory()

    @app.on_event('shutdown')
    async def shutdown() -> None:
        await MqttClient.disconnect()
        await RedisClient.disconnect()
        await EventBus.shutdown()
