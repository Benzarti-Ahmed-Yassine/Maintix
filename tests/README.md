# Maintix testing suite

This workspace now includes a CI-friendly cross-layer test setup for:

- Frontend UI components and page behavior
- Backend API routes and maintenance workflows
- AI pipeline execution and fallback behavior
- MCP agent and memory flows
- RAG ingestion and retrieval flows
- Integration connectors and orchestration
- Load simulation scenarios for industrial traffic
- Simulation coverage for realistic plant events

## Running locally

Python:
- pytest

Frontend:
- npm --prefix apps/frontend test
- npm --prefix apps/frontend run test:coverage

Load testing:
- pip install locust
- locust -f tests/load/locustfile.py
