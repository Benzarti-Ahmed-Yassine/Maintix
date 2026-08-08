from rag_server.modules.base import BaseRagModule
from rag_server.interfaces.payload import RagInput, RagOutput

class RankingModule(BaseRagModule):
    async def run(self, payload: RagInput) -> RagOutput:
        results = (payload.state or {}).get('retrieved_results', [])
        ranked = sorted(results, key=lambda item: item.get('score', 0), reverse=True)
        return RagOutput(results=ranked, context={'ranked_count': len(ranked)}, state={'ranked': ranked})
