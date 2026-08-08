from typing import Dict, Type
from rag_server.interfaces.module import RagModule

class ModuleRegistry:
    _modules: Dict[str, Type[RagModule]] = {}

    @classmethod
    def register(cls, name: str, module_cls: Type[RagModule]) -> None:
        cls._modules[name] = module_cls

    @classmethod
    def get(cls, name: str) -> Type[RagModule]:
        if name not in cls._modules:
            raise KeyError(f'Module {name} is not registered')
        return cls._modules[name]

    @classmethod
    def list_modules(cls) -> list[str]:
        return list(cls._modules.keys())

    @classmethod
    def clear(cls) -> None:
        cls._modules.clear()

    @classmethod
    def initialize_defaults(cls) -> None:
        if cls._modules:
            return

        from rag_server.modules.chunking import ChunkingModule
        from rag_server.modules.context_builder import ContextBuilderModule
        from rag_server.modules.documents import DocumentModule
        from rag_server.modules.embeddings import EmbeddingsModule
        from rag_server.modules.prompt_templates import PromptTemplateModule
        from rag_server.modules.vector_database import VectorDatabaseModule
        from rag_server.modules.retrievers import RetrieverModule
        from rag_server.modules.ranking import RankingModule
        from rag_server.modules.reranking import ReRankingModule

        cls.register('documents', DocumentModule)
        cls.register('chunking', ChunkingModule)
        cls.register('embeddings', EmbeddingsModule)
        cls.register('vector_database', VectorDatabaseModule)
        cls.register('retrievers', RetrieverModule)
        cls.register('context_builder', ContextBuilderModule)
        cls.register('prompt_templates', PromptTemplateModule)
        cls.register('ranking', RankingModule)
        cls.register('reranking', ReRankingModule)
