# Maintix RAG Server

This module defines the architecture for the Retrieval-Augmented Generation (RAG) component of Maintix.

## Purpose

The RAG architecture supports document ingestion, embedding creation, vector search, retrieval, prompt templating, context construction, and ranking.

## Modules

- Documents
- Chunking
- Embeddings
- Vector Database
- Retrievers
- Prompt Templates
- Context Builder
- Ranking
- ReRanking

## Architecture

- `rag_server/core` contains platform orchestration and shared utilities.
- `rag_server/modules` contains domain module interfaces and module stubs.
- `rag_server/interfaces` defines contracts for embeddings, retrieval, chunking, and ranking.
- `rag_server/schemas` contains Pydantic schemas for request and response payloads.
- `rag_server/services` contains higher-level orchestration and ranking services.
- `rag_server/adapters` contains external adapter contracts.

## Conventions

- Architecture only: no model or embedding implementation.
- Modules expose interface contracts and placeholder module stubs.
- Services orchestrate module interactions and signal flow.

## Next steps

- Implement concrete connectors for document stores and vector stores.
- Add prompt template management and reranking logic.
- Integrate with the AI platform and backend orchestration.
