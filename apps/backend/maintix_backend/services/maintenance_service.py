from maintix_backend.models.maintenance import MaintenanceOrder
from maintix_backend.repositories.maintenance_repository import MaintenanceRepository
from maintix_backend.services.base_service import BaseService

class MaintenanceService(BaseService[MaintenanceOrder]):
    def __init__(self, repository: MaintenanceRepository) -> None:
        self.repository = repository

    async def get(self, entity_id: int) -> MaintenanceOrder | None:
        return await self.repository.get(entity_id)

    async def list(self, **filters) -> list[MaintenanceOrder]:
        return await self.repository.list(**filters)

    async def create(self, data: MaintenanceOrder) -> MaintenanceOrder:
        return await self.repository.add(data)

    async def update(self, entity_id: int, data: MaintenanceOrder) -> MaintenanceOrder:
        order = await self.repository.get(entity_id)
        if order is None:
            raise ValueError('Maintenance order not found')
        return await self.repository.update(data)

    async def delete(self, entity_id: int) -> None:
        order = await self.repository.get(entity_id)
        if order:
            await self.repository.delete(order)
