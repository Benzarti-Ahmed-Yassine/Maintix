import os
from dotenv import load_dotenv
import redis.asyncio as redis

load_dotenv()

REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

class RedisClient:
    _client: redis.Redis | None = None

    @classmethod
    async def connect(cls) -> None:
        cls._client = redis.from_url(REDIS_URL, decode_responses=True)

    @classmethod
    async def disconnect(cls) -> None:
        if cls._client is not None:
            await cls._client.close()
            cls._client = None

    @classmethod
    def get(cls) -> redis.Redis:
        if cls._client is None:
            raise RuntimeError('Redis client not connected')
        return cls._client
