from rag_server.modules.base import BaseRagModule
from rag_server.interfaces.payload import RagInput, RagOutput
from rag_server.core.config import RagConfig
from rag_server.core.store import MemoryVectorStore

class RetrieverModule(BaseRagModule):
    def __init__(self) -> None:
        self.config = RagConfig()

    def _query_embedding(self, query: str) -> list[float]:
        values = [float(ord(char)) for char in query[: self.config.embedding_dim]]
        embedding = [0.0] * self.config.embedding_dim
        for idx, value in enumerate(values):
            embedding[idx] = value / 256.0
        return embedding

    async def run(self, payload: RagInput) -> RagOutput:
        query = payload.query or ''
        embedding = self._query_embedding(query)
        results = await MemoryVectorStore.query(embedding, top_k=self.config.top_k)
        return RagOutput(results=results, context={'retrieved_count': len(results)}, state={'retrieved_results': results})
