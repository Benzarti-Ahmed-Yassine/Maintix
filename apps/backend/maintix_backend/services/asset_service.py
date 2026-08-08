from maintix_backend.models.asset import Asset
from maintix_backend.repositories.asset_repository import AssetRepository
from maintix_backend.services.base_service import BaseService

class AssetService(BaseService[Asset]):
    def __init__(self, repository: AssetRepository) -> None:
        self.repository = repository

    async def get(self, entity_id: int) -> Asset | None:
        return await self.repository.get(entity_id)

    async def list(self, **filters) -> list[Asset]:
        return await self.repository.list(**filters)

    async def create(self, data: Asset) -> Asset:
        return await self.repository.add(data)

    async def update(self, entity_id: int, data: Asset) -> Asset:
        asset = await self.repository.get(entity_id)
        if asset is None:
            raise ValueError('Asset not found')
        return await self.repository.update(data)

    async def delete(self, entity_id: int) -> None:
        asset = await self.repository.get(entity_id)
        if asset:
            await self.repository.delete(asset)
