from ai_platform.interfaces.payload import ModuleOutput

class EvaluationService:
    def evaluate(self, output: ModuleOutput) -> dict[str, float]:
        return {'score': 0.0}
