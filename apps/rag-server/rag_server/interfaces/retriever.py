from abc import ABC, abstractmethod
from typing import Any
from rag_server.interfaces.payload import RagInput, RagOutput

class Retriever(ABC):

    @abstractmethod
    async def retrieve(self, payload: RagInput) -> RagOutput:
        pass
