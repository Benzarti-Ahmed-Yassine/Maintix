from collections.abc import AsyncGenerator

from fastapi import APIRouter, WebSocket

from maintix_backend.core.events.event_bus import EventBus

websocket_router = APIRouter(prefix='/ws', tags=['WebSocket'])


@websocket_router.websocket('/events')
async def events_socket(socket: WebSocket) -> None:
    await socket.accept()
    await socket.send_json({'type': 'connected', 'message': 'WebSocket connected'})

    async def dispatch(event_type: str, payload: dict) -> None:
        await socket.send_json({'type': event_type, 'payload': payload})

    EventBus.subscribe('mqtt.message', dispatch)
    try:
        while True:
            await socket.receive_text()
    except Exception:
        pass
    finally:
        EventBus.unsubscribe('mqtt.message', dispatch)
