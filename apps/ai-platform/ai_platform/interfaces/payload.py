from pydantic import BaseModel
from typing import Any

class ModuleInput(BaseModel):
    context: dict[str, Any]
    data: dict[str, Any]
    prompt: str | None = None

class ModuleOutput(BaseModel):
    result: dict[str, Any]
    metadata: dict[str, Any] | None = None
