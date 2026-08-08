from __future__ import annotations

from typing import Any
from pydantic import BaseModel

class AgentDescriptor(BaseModel):
    name: str
    description: str
    capabilities: list[str]

class AgentRequest(BaseModel):
    agent: str
    input: dict[str, Any]

class AgentResponse(BaseModel):
    agent: str
    output: dict[str, Any]
    status: str

class ToolDescriptor(BaseModel):
    name: str
    description: str
    inputs: dict[str, str]

class PromptSchema(BaseModel):
    name: str
    template: str
    description: str

class ContextEntry(BaseModel):
    source: str
    content: str
    metadata: dict[str, Any] | None = None

class MemoryEntry(BaseModel):
    id: str
    agent: str
    query: str
    response: str
    context: list[ContextEntry] | None = None

class MemoryRequest(BaseModel):
    agent: str
    query: str

class MemoryResponse(BaseModel):
    entries: list[MemoryEntry]
