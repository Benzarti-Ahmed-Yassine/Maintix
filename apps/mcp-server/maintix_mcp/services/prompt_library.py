from __future__ import annotations

from typing import Any
from pydantic import BaseModel

class PromptDefinition(BaseModel):
    name: str
    template: str
    description: str

class PromptLibrary:
    def __init__(self) -> None:
        self.prompts: dict[str, PromptDefinition] = {}

    def register(self, name: str, template: str, description: str) -> None:
        self.prompts[name] = PromptDefinition(name=name, template=template, description=description)

    def get(self, name: str) -> PromptDefinition | None:
        return self.prompts.get(name)

    def list(self) -> list[PromptDefinition]:
        return list(self.prompts.values())
