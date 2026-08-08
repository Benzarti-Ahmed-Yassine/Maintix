from __future__ import annotations

from typing import Any
from maintix_mcp.agents.base import AgentBase
from maintix_mcp.agents.diagnosis import DiagnosisAgent
from maintix_mcp.agents.planning import PlanningAgent
from maintix_mcp.agents.production import ProductionAgent
from maintix_mcp.agents.executive import ExecutiveAgent
from maintix_mcp.agents.conversation import ConversationAgent

class AgentManager:
    def __init__(self) -> None:
        self.agents: dict[str, AgentBase] = {
            DiagnosisAgent.name: DiagnosisAgent(),
            PlanningAgent.name: PlanningAgent(),
            ProductionAgent.name: ProductionAgent(),
            ExecutiveAgent.name: ExecutiveAgent(),
            ConversationAgent.name: ConversationAgent(),
        }

    def list_agents(self) -> list[str]:
        return list(self.agents.keys())

    def get(self, name: str) -> AgentBase:
        if name not in self.agents:
            raise KeyError(f"Agent '{name}' is not registered")
        return self.agents[name]

    async def act(self, name: str, payload: dict[str, Any]) -> dict[str, Any]:
        agent = self.get(name)
        return await agent.act(payload)
