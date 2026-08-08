from abc import ABC, abstractmethod
from typing import Generic, TypeVar

T = TypeVar('T')

class BaseService(ABC, Generic[T]):

    @abstractmethod
    async def get(self, entity_id: int) -> T | None:
        pass

    @abstractmethod
    async def list(self, **filters) -> list[T]:
        pass

    @abstractmethod
    async def create(self, data: T) -> T:
        pass

    @abstractmethod
    async def update(self, entity_id: int, data: T) -> T:
        pass

    @abstractmethod
    async def delete(self, entity_id: int) -> None:
        pass
