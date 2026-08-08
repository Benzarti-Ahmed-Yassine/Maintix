from fastapi import APIRouter, Depends, HTTPException, status
from maintix_backend.models.maintenance import MaintenanceOrder
from maintix_backend.dependencies.providers import get_maintenance_service
from maintix_backend.schemas.maintenance import (
    MaintenanceOrderCreateSchema,
    MaintenanceOrderSchema,
    MaintenanceOrderUpdateSchema,
)
from maintix_backend.services.maintenance_service import MaintenanceService

maintenance_router = APIRouter(prefix='/maintenance', tags=['Maintenance'])


@maintenance_router.get('/overview')
async def maintenance_overview() -> dict[str, int]:
    return {'backlog': 24, 'scheduledJobs': 18, 'availability': 94, 'assetRisk': 27}


@maintenance_router.post('', response_model=MaintenanceOrderSchema, status_code=status.HTTP_201_CREATED)
async def create_maintenance(
    payload: MaintenanceOrderCreateSchema,
    service: MaintenanceService = Depends(get_maintenance_service),
) -> MaintenanceOrder:
    maintenance = MaintenanceOrder(**payload.model_dump())
    return await service.create(maintenance)

@maintenance_router.get('', response_model=list[MaintenanceOrderSchema])
async def list_maintenance(
    status: str | None = None,
    assigned_to: int | None = None,
    asset_id: int | None = None,
    service: MaintenanceService = Depends(get_maintenance_service),
) -> list[MaintenanceOrder]:
    return await service.list(status=status, assigned_to=assigned_to, asset_id=asset_id)

@maintenance_router.get('/{maintenance_id}', response_model=MaintenanceOrderSchema)
async def get_maintenance(
    maintenance_id: int,
    service: MaintenanceService = Depends(get_maintenance_service),
) -> MaintenanceOrder:
    maintenance = await service.get(maintenance_id)
    if maintenance is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Maintenance order not found')
    return maintenance

@maintenance_router.put('/{maintenance_id}', response_model=MaintenanceOrderSchema)
async def update_maintenance(
    maintenance_id: int,
    payload: MaintenanceOrderUpdateSchema,
    service: MaintenanceService = Depends(get_maintenance_service),
) -> MaintenanceOrder:
    maintenance = await service.get(maintenance_id)
    if maintenance is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Maintenance order not found')

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(maintenance, key, value)

    return await service.update(maintenance_id, maintenance)

@maintenance_router.delete('/{maintenance_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_maintenance(
    maintenance_id: int,
    service: MaintenanceService = Depends(get_maintenance_service),
) -> None:
    maintenance = await service.get(maintenance_id)
    if maintenance is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Maintenance order not found')
    await service.delete(maintenance_id)
