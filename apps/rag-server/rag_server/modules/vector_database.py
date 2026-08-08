from rag_server.modules.base import BaseRagModule
from rag_server.interfaces.payload import RagInput, RagOutput
from rag_server.core.config import RagConfig
from rag_server.core.store import MemoryVectorStore

class VectorDatabaseModule(BaseRagModule):
    def __init__(self) -> None:
        self.config = RagConfig()

    async def run(self, payload: RagInput) -> RagOutput:
        state = payload.state or {}
        embeddings = state.get('embeddings', [])
        metadatas = state.get('metadatas', [])
        contents = state.get('contents', [])
        await MemoryVectorStore.initialize(self.config.embedding_dim)
        if embeddings and metadatas and contents:
            await MemoryVectorStore.upsert(embeddings, metadatas, contents)
        return RagOutput(results=[{'stored_vectors': len(embeddings)}], context={'vector_count': len(embeddings)}, state={'vector_count': len(embeddings)})
