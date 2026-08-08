from __future__ import annotations

from typing import Any
from maintix_mcp.agents.base import AgentBase

class ConversationAgent(AgentBase):
    name = 'conversation'
    description = 'Maintain dialog state and agent-user interaction memory.'

    async def act(self, payload: dict[str, Any]) -> dict[str, Any]:
        message = payload.get('message', '')
        return {'reply': f"Conversation memory updated for message: {message}"}
