from sqlalchemy import select

from maintix_backend.db.session import AsyncSession
from maintix_backend.models.user import User
from maintix_backend.repositories.base_repository import BaseRepository

class UserRepository(BaseRepository[User]):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def add(self, entity: User) -> User:
        self.session.add(entity)
        await self.session.flush()
        return entity

    async def get(self, entity_id: int) -> User | None:
        return await self.session.get(User, entity_id)

    async def list(self, **filters) -> list[User]:
        stmt = select(User)
        for field, value in filters.items():
            if hasattr(User, field) and value is not None:
                stmt = stmt.where(getattr(User, field) == value)

        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def update(self, entity: User) -> User:
        self.session.add(entity)
        await self.session.flush()
        return entity

    async def delete(self, entity: User) -> None:
        await self.session.delete(entity)
