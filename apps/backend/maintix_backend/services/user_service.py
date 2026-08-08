from maintix_backend.models.user import User
from maintix_backend.repositories.user_repository import UserRepository
from maintix_backend.services.base_service import BaseService

class UserService(BaseService[User]):
    def __init__(self, repository: UserRepository) -> None:
        self.repository = repository

    async def get(self, entity_id: int) -> User | None:
        return await self.repository.get(entity_id)

    async def list(self, **filters) -> list[User]:
        return await self.repository.list(**filters)

    async def create(self, data: User) -> User:
        return await self.repository.add(data)

    async def update(self, entity_id: int, data: User) -> User:
        user = await self.repository.get(entity_id)
        if user is None:
            raise ValueError('User not found')
        return await self.repository.update(data)

    async def delete(self, entity_id: int) -> None:
        user = await self.repository.get(entity_id)
        if user:
            await self.repository.delete(user)
