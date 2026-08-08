from maintix_backend.core.messaging.redis_client import RedisClient
from maintix_backend.core.events.event_bus import EventBus

class RedisWorker:
    @staticmethod
    async def start() -> None:
        client = RedisClient.get()
        pubsub = client.pubsub()
        await pubsub.subscribe('maintix:events')

        async for message in pubsub.listen():
            if message['type'] == 'message':
                await EventBus.publish('redis.message', {'data': message['data']})
