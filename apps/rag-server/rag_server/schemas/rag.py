from __future__ import annotations

from typing import Any
from pydantic import BaseModel

class DocumentSchema(BaseModel):
    id: str
    source: str | None = None
    content: str
    metadata: dict[str, Any] | None = None

class IngestRequest(BaseModel):
    documents: list[DocumentSchema]

class IngestResponse(BaseModel):
    document_count: int
    chunk_count: int
    embedding_count: int
    vector_count: int

class QueryRequest(BaseModel):
    query: str
    top_k: int | None = None

class QueryResponse(BaseModel):
    query: str
    prompt: str
    citations: list[str]
    context: str
    results: list[dict[str, Any]]
    retrieved_count: int
    ranked_count: int
    reranked_count: int
