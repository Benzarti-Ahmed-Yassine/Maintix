from __future__ import annotations

from typing import Any
from rag_server.core.orchestrator import RagOrchestrator
from rag_server.core.registry import ModuleRegistry
from rag_server.interfaces.payload import RagInput

class RagService:
    def __init__(self) -> None:
        ModuleRegistry.initialize_defaults()
        self.orchestrator = RagOrchestrator()

    async def ingest_documents(self, documents: list[dict[str, Any]]) -> dict[str, Any]:
        payload = RagInput(query='', documents=documents, metadata={}, state={})
        outputs = await self.orchestrator.pipeline(
            ['documents', 'chunking', 'embeddings', 'vector_database'], payload
        )

        return {
            'document_count': len(outputs['documents'].results),
            'chunk_count': len(outputs['chunking'].results),
            'embedding_count': len(outputs['embeddings'].results),
            'vector_count': outputs['vector_database'].state.get('vector_count', 0),
        }

    async def query(self, query: str, top_k: int | None = None) -> dict[str, Any]:
        metadata = {'top_k': top_k} if top_k is not None else {}
        payload = RagInput(query=query, documents=None, metadata=metadata, state={})
        outputs = await self.orchestrator.pipeline(
            ['retrievers', 'context_builder', 'prompt_templates', 'ranking', 'reranking'], payload
        )

        prompt_result = outputs['prompt_templates'].results[0] if outputs['prompt_templates'].results else {}
        context_result = outputs['context_builder'].results[0] if outputs['context_builder'].results else {}
        reranked = outputs['reranking'].results

        return {
            'query': query,
            'prompt': prompt_result.get('prompt', ''),
            'citations': prompt_result.get('citations', []),
            'context': context_result.get('context', ''),
            'results': reranked,
            'retrieved_count': len(outputs['retrievers'].results),
            'ranked_count': len(outputs['ranking'].results),
            'reranked_count': len(reranked),
        }
