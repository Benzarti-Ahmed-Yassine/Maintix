from ai_platform.modules.base import BaseAiModule
from ai_platform.interfaces.payload import ModuleInput, ModuleOutput

class RecommendationEngineModule(BaseAiModule):
    async def run(self, payload: ModuleInput) -> ModuleOutput:
        failure = payload.context.get('failure_classification', {})
        rul = payload.context.get('rul', {})
        recommendations = []

        if failure.get('severity') == 'critical':
            recommendations.append('Schedule immediate inspection and stop equipment if needed')
        elif failure.get('severity') == 'warning':
            recommendations.append('Review sensor trends and schedule preventive maintenance')
        else:
            recommendations.append('Continue normal monitoring cadence')

        if rul.get('predicted_rul_days', 0) < 30:
            recommendations.append('Prepare replacement parts and review maintenance backlog')

        return ModuleOutput(
            result={'recommendations': recommendations, 'confidence': 0.88},
            metadata={'module': 'recommendation_engine'},
        )
