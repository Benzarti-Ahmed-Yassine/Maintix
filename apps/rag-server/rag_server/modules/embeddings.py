from rag_server.modules.base import BaseRagModule
from rag_server.interfaces.payload import RagInput, RagOutput
from rag_server.core.config import RagConfig

class EmbeddingsModule(BaseRagModule):
    def __init__(self) -> None:
        self.config = RagConfig()

    def _simple_embedding(self, text: str) -> list[float]:
        embedding = [0.0] * self.config.embedding_dim
        for index, token in enumerate(text.split()):
            embedding[index % self.config.embedding_dim] += float(sum(ord(c) for c in token)) / 1000.0
        return [value / (len(text.split()) or 1) for value in embedding]

    async def run(self, payload: RagInput) -> RagOutput:
        chunks = (payload.state or {}).get('chunks', [])
        if not chunks:
            return RagOutput(results=[], context={'embedding_count': 0}, state={'embeddings': []})

        embeddings = [self._simple_embedding(str(chunk['content'])) for chunk in chunks]
        metadatas = [chunk['metadata'] for chunk in chunks]
        contents = [str(chunk['content']) for chunk in chunks]

        return RagOutput(
            results=[{'embedding': emb, 'metadata': meta} for emb, meta in zip(embeddings, metadatas)],
            context={'embedding_count': len(embeddings)},
            state={'embeddings': embeddings, 'metadatas': metadatas, 'contents': contents},
        )
