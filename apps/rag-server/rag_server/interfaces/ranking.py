from abc import ABC, abstractmethod
from typing import Any
from rag_server.interfaces.payload import RagOutput

class Ranker(ABC):

    @abstractmethod
    async def rank(self, outputs: list[RagOutput]) -> list[RagOutput]:
        pass

    @abstractmethod
    async def rerank(self, output: RagOutput) -> RagOutput:
        pass
