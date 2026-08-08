from typing import Any

class ExternalInferenceAdapter:
    async def request(self, payload: dict[str, Any]) -> dict[str, Any]:
        return {'status': 'adapter placeholder'}
