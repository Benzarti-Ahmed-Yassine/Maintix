from fastapi import APIRouter

health_router = APIRouter(prefix='/health', tags=['Health'])

@health_router.get('', summary='Health check')
async def health() -> dict[str, str]:
    return {'status': 'ok'}
