from pydantic import BaseModel
from typing import Any

class RagInput(BaseModel):
    query: str
    documents: list[dict[str, Any]] | None = None
    metadata: dict[str, Any] | None = None
    state: dict[str, Any] | None = None

class RagOutput(BaseModel):
    results: list[dict[str, Any]]
    context: dict[str, Any] | None = None
    score: float | None = None
    state: dict[str, Any] | None = None
