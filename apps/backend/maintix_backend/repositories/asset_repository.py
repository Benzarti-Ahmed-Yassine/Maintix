from sqlalchemy import select

from maintix_backend.db.session import AsyncSession
from maintix_backend.models.asset import Asset
from maintix_backend.repositories.base_repository import BaseRepository

class AssetRepository(BaseRepository[Asset]):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def add(self, entity: Asset) -> Asset:
        self.session.add(entity)
        await self.session.flush()
        return entity

    async def get(self, entity_id: int) -> Asset | None:
        return await self.session.get(Asset, entity_id)

    async def list(self, **filters) -> list[Asset]:
        stmt = select(Asset)
        for field, value in filters.items():
            if hasattr(Asset, field) and value is not None:
                stmt = stmt.where(getattr(Asset, field) == value)

        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def update(self, entity: Asset) -> Asset:
        self.session.add(entity)
        await self.session.flush()
        return entity

    async def delete(self, entity: Asset) -> None:
        await self.session.delete(entity)
