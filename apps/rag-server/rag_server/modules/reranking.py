from rag_server.modules.base import BaseRagModule
from rag_server.interfaces.payload import RagInput, RagOutput

class ReRankingModule(BaseRagModule):
    async def run(self, payload: RagInput) -> RagOutput:
        ranked = (payload.state or {}).get('ranked', [])
        reranked = sorted(ranked, key=lambda item: item.get('score', 0), reverse=True)
        return RagOutput(results=reranked, context={'reranked_count': len(reranked)}, state={'reranked': reranked})
