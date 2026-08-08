from abc import ABC, abstractmethod
from typing import Generic, TypeVar

T = TypeVar('T')

class BaseRepository(ABC, Generic[T]):

    @abstractmethod
    async def add(self, entity: T) -> T:
        pass

    @abstractmethod
    async def get(self, entity_id: int) -> T | None:
        pass

    @abstractmethod
    async def list(self, **filters) -> list[T]:
        pass

    @abstractmethod
    async def update(self, entity: T) -> T:
        pass

    @abstractmethod
    async def delete(self, entity: T) -> None:
        pass
