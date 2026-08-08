from fastapi import APIRouter

director_router = APIRouter(prefix='/director', tags=['Director'])

@director_router.get('/overview')
async def overview() -> dict[str, str]:
    return {'message': 'Director architecture endpoint'}
