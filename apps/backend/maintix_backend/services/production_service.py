from maintix_backend.models.production import ProductionSchedule
from maintix_backend.repositories.production_repository import ProductionRepository
from maintix_backend.services.base_service import BaseService

class ProductionService(BaseService[ProductionSchedule]):
    def __init__(self, repository: ProductionRepository) -> None:
        self.repository = repository

    async def get(self, entity_id: int) -> ProductionSchedule | None:
        return await self.repository.get(entity_id)

    async def list(self, **filters) -> list[ProductionSchedule]:
        return await self.repository.list(**filters)

    async def create(self, data: ProductionSchedule) -> ProductionSchedule:
        return await self.repository.add(data)

    async def update(self, entity_id: int, data: ProductionSchedule) -> ProductionSchedule:
        schedule = await self.repository.get(entity_id)
        if schedule is None:
            raise ValueError('Production schedule not found')
        return await self.repository.update(data)

    async def delete(self, entity_id: int) -> None:
        schedule = await self.repository.get(entity_id)
        if schedule:
            await self.repository.delete(schedule)
