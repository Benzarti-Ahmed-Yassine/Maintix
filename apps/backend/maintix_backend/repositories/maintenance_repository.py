from sqlalchemy import select

from maintix_backend.db.session import AsyncSession
from maintix_backend.models.maintenance import MaintenanceOrder
from maintix_backend.repositories.base_repository import BaseRepository

class MaintenanceRepository(BaseRepository[MaintenanceOrder]):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def add(self, entity: MaintenanceOrder) -> MaintenanceOrder:
        self.session.add(entity)
        await self.session.flush()
        await self.session.commit()
        return entity

    async def get(self, entity_id: int) -> MaintenanceOrder | None:
        return await self.session.get(MaintenanceOrder, entity_id)

    async def list(self, **filters) -> list[MaintenanceOrder]:
        stmt = select(MaintenanceOrder)
        for field, value in filters.items():
            if hasattr(MaintenanceOrder, field) and value is not None:
                stmt = stmt.where(getattr(MaintenanceOrder, field) == value)

        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def update(self, entity: MaintenanceOrder) -> MaintenanceOrder:
        self.session.add(entity)
        await self.session.flush()
        await self.session.commit()
        return entity

    async def delete(self, entity: MaintenanceOrder) -> None:
        await self.session.delete(entity)
        await self.session.commit()
