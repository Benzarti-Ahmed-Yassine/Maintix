from __future__ import annotations

from typing import Any
from maintix_mcp.agents.base import AgentBase

class ExecutiveAgent(AgentBase):
    name = 'executive'
    description = 'Coordinate agent outcomes and make high-level decisions.'

    async def act(self, payload: dict[str, Any]) -> dict[str, Any]:
        summary = payload.get('summary', 'no summary')
        return {'executive_decision': f"Executive decision based on: {summary}", 'action': 'approve'}
