from typing import Any

class PromptService:
    def build_prompt(self, goal: str, context: dict[str, Any], data: dict[str, Any]) -> str:
        context_summary = ', '.join(f'{k}={v}' for k, v in context.items() if k != 'sensor_values')
        data_summary = ', '.join(f'{k}={v}' for k, v in data.items() if k != 'sensor_values')
        return (
            f'Goal: {goal}. Context: {context_summary or "none"}. '
            f'Data: {data_summary or "none"}. '
            'Generate a concise prediction and next steps.'
        )
