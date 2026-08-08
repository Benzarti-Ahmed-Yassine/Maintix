from sqlalchemy import select

from maintix_backend.db.session import AsyncSession
from maintix_backend.models.production import ProductionSchedule
from maintix_backend.repositories.base_repository import BaseRepository

class ProductionRepository(BaseRepository[ProductionSchedule]):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def add(self, entity: ProductionSchedule) -> ProductionSchedule:
        self.session.add(entity)
        await self.session.flush()
        return entity

    async def get(self, entity_id: int) -> ProductionSchedule | None:
        return await self.session.get(ProductionSchedule, entity_id)

    async def list(self, **filters) -> list[ProductionSchedule]:
        stmt = select(ProductionSchedule)
        for field, value in filters.items():
            if hasattr(ProductionSchedule, field) and value is not None:
                stmt = stmt.where(getattr(ProductionSchedule, field) == value)

        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def update(self, entity: ProductionSchedule) -> ProductionSchedule:
        self.session.add(entity)
        await self.session.flush()
        return entity

    async def delete(self, entity: ProductionSchedule) -> None:
        await self.session.delete(entity)
