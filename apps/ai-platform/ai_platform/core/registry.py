from typing import Dict, Type
from ai_platform.interfaces.module import AiModule

class ModuleRegistry:
    _modules: Dict[str, Type[AiModule]] = {}

    @classmethod
    def register(cls, name: str, module_cls: Type[AiModule]) -> None:
        cls._modules[name] = module_cls

    @classmethod
    def get(cls, name: str) -> Type[AiModule]:
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

        from ai_platform.modules.anomaly_detection import AnomalyDetectionModule
        from ai_platform.modules.context_builder import ContextBuilderModule
        from ai_platform.modules.failure_classification import FailureClassificationModule
        from ai_platform.modules.inference import InferenceModule
        from ai_platform.modules.prompt_manager import PromptManagerModule
        from ai_platform.modules.recommendation_engine import RecommendationEngineModule
        from ai_platform.modules.root_cause_analysis import RootCauseAnalysisModule
        from ai_platform.modules.explainable_ai import ExplainableAiModule
        from ai_platform.modules.rul import RulModule
        from ai_platform.modules.orchestrator import OrchestratorModule

        cls.register('context_builder', ContextBuilderModule)
        cls.register('prompt_manager', PromptManagerModule)
        cls.register('inference', InferenceModule)
        cls.register('anomaly_detection', AnomalyDetectionModule)
        cls.register('failure_classification', FailureClassificationModule)
        cls.register('rul', RulModule)
        cls.register('root_cause_analysis', RootCauseAnalysisModule)
        cls.register('recommendation_engine', RecommendationEngineModule)
        cls.register('explainable_ai', ExplainableAiModule)
        cls.register('orchestrator', OrchestratorModule)
