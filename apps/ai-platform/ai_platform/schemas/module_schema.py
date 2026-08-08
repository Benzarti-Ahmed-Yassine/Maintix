from pydantic import BaseModel
from typing import Any

class ModuleRequestSchema(BaseModel):
    module_name: str
    payload: dict[str, Any]

class ModuleResponseSchema(BaseModel):
    result: dict[str, Any]
    metadata: dict[str, Any] | None = None
