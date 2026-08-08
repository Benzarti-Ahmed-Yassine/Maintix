from rag_server.interfaces.payload import RagOutput

class RankingService:
    async def rank(self, outputs: list[RagOutput]) -> list[RagOutput]:
        return outputs

    async def rerank(self, output: RagOutput) -> RagOutput:
        return output
