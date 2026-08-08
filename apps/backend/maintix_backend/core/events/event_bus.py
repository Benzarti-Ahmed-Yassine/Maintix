import inspect
from typing import Any, Awaitable, Callable

EventHandler = Callable[[str, dict[str, Any]], None | Awaitable[None]]


class EventBus:
    _handlers: dict[str, list[EventHandler]] = {}

    @classmethod
    async def initialize(cls) -> None:
        cls._handlers = {}

    @classmethod
    async def shutdown(cls) -> None:
        cls._handlers.clear()

    @classmethod
    def subscribe(cls, event_type: str, handler: EventHandler) -> None:
        cls._handlers.setdefault(event_type, []).append(handler)

    @classmethod
    def unsubscribe(cls, event_type: str, handler: EventHandler) -> None:
        handlers = cls._handlers.get(event_type, [])
        cls._handlers[event_type] = [item for item in handlers if item is not handler]

    @classmethod
    async def publish(cls, event_type: str, payload: dict[str, Any]) -> None:
        for handler in cls._handlers.get(event_type, []):
            result = handler(event_type, payload)
            if inspect.isawaitable(result):
                await result
