from fastapi import APIRouter

mqtt_router = APIRouter(prefix='/mqtt', tags=['MQTT'])

@mqtt_router.get('/status')
async def mqtt_status() -> dict[str, str]:
    return {'status': 'mqtt architecture ready'}
