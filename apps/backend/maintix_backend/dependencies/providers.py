from fastapi import Depends
from maintix_backend.db.session import AsyncSession, get_session
from maintix_backend.repositories.asset_repository import AssetRepository
from maintix_backend.repositories.maintenance_repository import MaintenanceRepository
from maintix_backend.repositories.production_repository import ProductionRepository
from maintix_backend.repositories.user_repository import UserRepository
from maintix_backend.services.asset_service import AssetService
from maintix_backend.services.maintenance_service import MaintenanceService
from maintix_backend.services.production_service import ProductionService
from maintix_backend.services.user_service import UserService

async def get_repository(repository_type: str, session: AsyncSession):
    if repository_type == 'user':
        return UserRepository(session)
    if repository_type == 'asset':
        return AssetRepository(session)
    if repository_type == 'maintenance':
        return MaintenanceRepository(session)
    if repository_type == 'production':
        return ProductionRepository(session)

    raise ValueError('Unknown repository type')

async def get_service(service_type: str, session: AsyncSession):
    repository = await get_repository(service_type, session)

    if service_type == 'user':
        return UserService(repository)
    if service_type == 'asset':
        return AssetService(repository)
    if service_type == 'maintenance':
        return MaintenanceService(repository)
    if service_type == 'production':
        return ProductionService(repository)

    raise ValueError('Unknown service type')

async def get_production_service(session: AsyncSession = Depends(get_session)) -> ProductionService:
    return await get_service('production', session)

async def get_maintenance_service(session: AsyncSession = Depends(get_session)) -> MaintenanceService:
    return await get_service('maintenance', session)
