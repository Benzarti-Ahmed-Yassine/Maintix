from dataclasses import dataclass, field
from dotenv import load_dotenv
import os

load_dotenv()

@dataclass
class AIConfig:
    default_model: str = os.getenv('AI_DEFAULT_MODEL', 'mock-large')
    fallback_model: str = os.getenv('AI_FALLBACK_MODEL', 'mock-small')
    use_external_adapter: bool = os.getenv('AI_USE_EXTERNAL_ADAPTER', 'false').lower() == 'true'
    request_timeout_seconds: int = int(os.getenv('AI_REQUEST_TIMEOUT_SECONDS', '10'))
    pipeline_steps: list[str] = field(default_factory=lambda: [
        'context_builder',
        'prompt_manager',
        'inference',
        'anomaly_detection',
        'failure_classification',
        'rul',
        'root_cause_analysis',
        'recommendation_engine',
        'explainable_ai',
    ])
