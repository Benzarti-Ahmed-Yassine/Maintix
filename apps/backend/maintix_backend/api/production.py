from fastapi import APIRouter, Depends, HTTPException, status
from maintix_backend.models.production import ProductionSchedule
from maintix_backend.dependencies.providers import get_production_service
from maintix_backend.schemas.production import (
    ProductionScheduleCreateSchema,
    ProductionScheduleSchema,
    ProductionScheduleUpdateSchema,
)
from maintix_backend.services.production_service import ProductionService

production_router = APIRouter(prefix='/production', tags=['Production'])


@production_router.get('/metrics')
async def production_metrics() -> list[dict[str, str]]:
    return [
        {'label': 'Line A', 'value': '14,600', 'unit': 'pcs', 'delta': '+4.1%'},
        {'label': 'Line B', 'value': '12,200', 'unit': 'pcs', 'delta': '+2.8%'},
        {'label': 'Line C', 'value': '9,900', 'unit': 'pcs', 'delta': '-0.9%'},
    ]


@production_router.post('', response_model=ProductionScheduleSchema, status_code=status.HTTP_201_CREATED)
async def create_production(
    payload: ProductionScheduleCreateSchema,
    service: ProductionService = Depends(get_production_service),
) -> ProductionSchedule:
    production = ProductionSchedule(**payload.model_dump())
    return await service.create(production)

@production_router.get('', response_model=list[ProductionScheduleSchema])
async def list_production(
    name: str | None = None,
    status: str | None = None,
    service: ProductionService = Depends(get_production_service),
) -> list[ProductionSchedule]:
    return await service.list(name=name, status=status)

@production_router.get('/{production_id}', response_model=ProductionScheduleSchema)
async def get_production(
    production_id: int,
    service: ProductionService = Depends(get_production_service),
) -> ProductionSchedule:
    production = await service.get(production_id)
    if production is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Production schedule not found')
    return production

@production_router.put('/{production_id}', response_model=ProductionScheduleSchema)
async def update_production(
    production_id: int,
    payload: ProductionScheduleUpdateSchema,
    service: ProductionService = Depends(get_production_service),
) -> ProductionSchedule:
    production = await service.get(production_id)
    if production is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Production schedule not found')

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(production, key, value)

    return await service.update(production_id, production)

@production_router.delete('/{production_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_production(
    production_id: int,
    service: ProductionService = Depends(get_production_service),
) -> None:
    production = await service.get(production_id)
    if production is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Production schedule not found')
    await service.delete(production_id)
